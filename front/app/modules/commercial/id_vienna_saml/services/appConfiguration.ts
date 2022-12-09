import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  export interface IAppConfigurationSettings {
    vienna_citizen_login?: {
      allowed: boolean;
      enabled: boolean;
    };
  }
}
