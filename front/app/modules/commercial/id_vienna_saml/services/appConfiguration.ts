import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  export interface IAppConfigurationSettings {
    vienna_login?: {
      allowed: boolean;
      enabled: boolean;
    };
  }
}
