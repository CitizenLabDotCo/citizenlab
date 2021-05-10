import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  export interface IAppConfigurationSettings {
    user_confirmation?: {
      allowed: boolean;
      enabled: boolean;
    };
  }
}
