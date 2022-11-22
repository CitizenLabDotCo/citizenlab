import { ModuleConfiguration } from 'utils/moduleUtils';
import { IUsersByBirthyear } from './services/stats';

declare module 'resources/GetSerieFromStream' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
  }
}

const configuration: ModuleConfiguration = {};

export default configuration;
