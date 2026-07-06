import { IdMethods, IDAzureAdMethod, IDAzureAdB2cMethod } from 'api/id_methods/types';

export const getAzureConfig = (idMethods?: IdMethods) => {
  const azureAdSettings = idMethods?.data.find(
    (idMethod) => idMethod.attributes.name === 'azureactivedirectory'
  ) as IDAzureAdMethod | undefined;

  return azureAdSettings;
}

export const getAzureB2cConfig = (idMethods?: IdMethods) => {
  const azureAdB2cSettings = idMethods?.data.find(
    (idMethod) => idMethod.attributes.name === 'azureactivedirectory_b2c'
  ) as IDAzureAdB2cMethod | undefined;

  return azureAdB2cSettings;
}