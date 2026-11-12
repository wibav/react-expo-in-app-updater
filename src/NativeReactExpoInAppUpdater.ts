import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  checkForUpdate(updateType: string): Promise<string>;
}

export default TurboModuleRegistry.get<Spec>('ReactExpoInAppUpdater');
