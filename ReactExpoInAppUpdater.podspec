require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ReactExpoInAppUpdater"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/wibav/react-expo-in-app-updater.git", :tag => "v#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  # The Objective-C++ header imports the codegen spec, which Swift cannot parse:
  # keep it out of the module's public umbrella header.
  s.private_header_files = "ios/**/*.h"

  # Adds React Native's dependencies and runs codegen for the TurboModule spec.
  install_modules_dependencies(s)
end
