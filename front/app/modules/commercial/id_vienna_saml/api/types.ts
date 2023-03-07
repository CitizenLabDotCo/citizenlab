import 'api/app_configuration/types';

declare module 'api/app_configuration/types' {
  export interface IAppConfigurationSettings {
    vienna_citizen_login?: {
      allowed: boolean;
      enabled: boolean;
    };
  }
}
