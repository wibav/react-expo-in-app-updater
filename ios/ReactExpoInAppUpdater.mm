#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReactExpoInAppUpdater, NSObject)

RCT_EXTERN_METHOD(checkForUpdate:(NSString *)updateType
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
