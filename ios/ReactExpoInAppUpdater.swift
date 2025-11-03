import Foundation
import StoreKit

#if canImport(UIKit)
import UIKit
#endif

@objc(ReactExpoInAppUpdater)
class ReactExpoInAppUpdater: NSObject {
    
    private var storeProductViewController: SKStoreProductViewController?
    
    // MARK: - Public Methods
    
    @objc(checkForUpdate:withResolver:withRejecter:)
    func checkForUpdate(_ updateType: String, resolve: @escaping @convention(block) (Any?) -> Void, reject: @escaping @convention(block) (String?, String?, Error?) -> Void) -> Void {
        
        guard let bundleId = Bundle.main.bundleIdentifier else {
            reject("NO_BUNDLE_ID", "Could not get bundle identifier", nil)
            return
        }
        
        // Get current version
        guard let currentVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String else {
            reject("NO_VERSION", "Could not get current app version", nil)
            return
        }
        
        // Fetch App Store version
        fetchAppStoreVersion(bundleId: bundleId) { [weak self] appStoreVersion, appId, error in
            guard let self = self else { return }
            
            if let error = error {
                reject("FETCH_ERROR", error.localizedDescription, error)
                return
            }
            
            guard let appStoreVersion = appStoreVersion, let appId = appId else {
                reject("NO_DATA", "Could not fetch App Store data", nil)
                return
            }
            
            // Compare versions
            if self.isUpdateAvailable(current: currentVersion, appStore: appStoreVersion) {
                DispatchQueue.main.async {
                    switch updateType.uppercased() {
                    case "IMMEDIATE":
                        self.showImmediateUpdate(appId: appId, resolve: resolve, reject: reject)
                    case "FLEXIBLE":
                        self.showFlexibleUpdate(appId: appId, resolve: resolve, reject: reject)
                    default:
                        reject("INVALID_TYPE", "Update type must be 'FLEXIBLE' or 'IMMEDIATE'", nil)
                    }
                }
            } else {
                resolve("No update available" as NSString)
            }
        }
    }
    
    // MARK: - Private Methods
    
    private func fetchAppStoreVersion(bundleId: String, completion: @escaping (String?, String?, Error?) -> Void) {
        let urlString = "https://itunes.apple.com/lookup?bundleId=\(bundleId)"
        
        guard let url = URL(string: urlString) else {
            completion(nil, nil, NSError(domain: "InvalidURL", code: -1, userInfo: nil))
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                completion(nil, nil, error)
                return
            }
            
            guard let data = data else {
                completion(nil, nil, NSError(domain: "NoData", code: -1, userInfo: nil))
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let results = json["results"] as? [[String: Any]] {
                    
                    // Check if app was found in App Store
                    guard let firstResult = results.first else {
                        let error = NSError(
                            domain: "com.reactexpoinappupdater",
                            code: 404,
                            userInfo: [
                                NSLocalizedDescriptionKey: "App not found in App Store. Bundle ID: \(bundleId)",
                                NSLocalizedRecoverySuggestionErrorKey: "This app is not published in the App Store yet. For testing, use a bundle ID of a published app (e.g., 'com.facebook.Facebook')."
                            ]
                        )
                        completion(nil, nil, error)
                        return
                    }
                    
                    let version = firstResult["version"] as? String
                    let trackId = firstResult["trackId"] as? Int
                    completion(version, trackId != nil ? "\(trackId!)" : nil, nil)
                } else {
                    let error = NSError(
                        domain: "com.reactexpoinappupdater",
                        code: -1,
                        userInfo: [
                            NSLocalizedDescriptionKey: "Failed to parse iTunes Lookup API response",
                            NSLocalizedRecoverySuggestionErrorKey: "Unexpected JSON format from App Store API"
                        ]
                    )
                    completion(nil, nil, error)
                }
            } catch {
                let wrappedError = NSError(
                    domain: "com.reactexpoinappupdater",
                    code: -2,
                    userInfo: [
                        NSLocalizedDescriptionKey: "JSON parsing error: \(error.localizedDescription)",
                        NSLocalizedRecoverySuggestionErrorKey: "Check network connection and try again"
                    ]
                )
                completion(nil, nil, wrappedError)
            }
        }.resume()
    }
    
    private func isUpdateAvailable(current: String, appStore: String) -> Bool {
        let currentComponents = current.split(separator: ".").compactMap { Int($0) }
        let appStoreComponents = appStore.split(separator: ".").compactMap { Int($0) }
        
        let maxLength = max(currentComponents.count, appStoreComponents.count)
        
        for i in 0..<maxLength {
            let currentValue = i < currentComponents.count ? currentComponents[i] : 0
            let appStoreValue = i < appStoreComponents.count ? appStoreComponents[i] : 0
            
            if appStoreValue > currentValue {
                return true
            } else if appStoreValue < currentValue {
                return false
            }
        }
        
        return false
    }
    
    private func showImmediateUpdate(appId: String, resolve: @escaping @convention(block) (Any?) -> Void, reject: @escaping @convention(block) (String?, String?, Error?) -> Void) {
        #if canImport(UIKit)
        guard let rootViewController = UIApplication.shared.keyWindow?.rootViewController else {
            reject("NO_ROOT_VC", "Could not get root view controller", nil)
            return
        }
        
        let alert = UIAlertController(
            title: "Update Required",
            message: "A new version is available. Please update to continue using the app.",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "Update Now", style: .default) { [weak self] _ in
            self?.openAppStore(appId: appId, resolve: resolve, reject: reject)
        })
        
        rootViewController.present(alert, animated: true)
        #endif
    }
    
    private func showFlexibleUpdate(appId: String, resolve: @escaping @convention(block) (Any?) -> Void, reject: @escaping @convention(block) (String?, String?, Error?) -> Void) {
        #if canImport(UIKit)
        guard let rootViewController = UIApplication.shared.keyWindow?.rootViewController else {
            reject("NO_ROOT_VC", "Could not get root view controller", nil)
            return
        }
        
        let alert = UIAlertController(
            title: "Update Available",
            message: "A new version is available. Would you like to update now?",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "Update Now", style: .default) { [weak self] _ in
            self?.openAppStore(appId: appId, resolve: resolve, reject: reject)
        })
        
        alert.addAction(UIAlertAction(title: "Later", style: .cancel) { _ in
            resolve("Update cancelled" as NSString)
        })
        
        rootViewController.present(alert, animated: true)
        #endif
    }
    
    private func openAppStore(appId: String, resolve: @escaping @convention(block) (Any?) -> Void, reject: @escaping @convention(block) (String?, String?, Error?) -> Void) {
        #if canImport(UIKit)
        guard let rootViewController = UIApplication.shared.keyWindow?.rootViewController else {
            reject("NO_ROOT_VC", "Could not get root view controller", nil)
            return
        }
        
        let storeVC = SKStoreProductViewController()
        storeVC.delegate = self
        self.storeProductViewController = storeVC
        
        let parameters = [SKStoreProductParameterITunesItemIdentifier: appId]
        storeVC.loadProduct(withParameters: parameters) { success, error in
            if success {
                rootViewController.present(storeVC, animated: true) {
                    resolve("App Store opened" as NSString)
                }
            } else {
                reject("STORE_ERROR", error?.localizedDescription ?? "Could not open App Store", error)
            }
        }
        #endif
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

// MARK: - SKStoreProductViewControllerDelegate

extension ReactExpoInAppUpdater: SKStoreProductViewControllerDelegate {
    func productViewControllerDidFinish(_ viewController: SKStoreProductViewController) {
        viewController.dismiss(animated: true, completion: nil)
        self.storeProductViewController = nil
    }
}
