import { IAppConfigurationData } from '../app_configuration/types';

export const coreSettings = (appConfiguration: IAppConfigurationData) =>
  appConfiguration.attributes.settings.core;
