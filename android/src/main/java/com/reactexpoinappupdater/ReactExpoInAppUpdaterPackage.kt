package com.reactexpoinappupdater

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class ReactExpoInAppUpdaterPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == ReactExpoInAppUpdaterModule.NAME) {
      ReactExpoInAppUpdaterModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      // Positional arguments: the parameter names differ between React Native
      // versions (`_name` in 0.76, `name` in later releases).
      ReactExpoInAppUpdaterModule.NAME to ReactModuleInfo(
        ReactExpoInAppUpdaterModule.NAME, // name
        ReactExpoInAppUpdaterModule.NAME, // className
        false, // canOverrideExistingModule
        false, // needsEagerInit
        false, // isCxxModule
        true // isTurboModule
      )
    )
  }
}
