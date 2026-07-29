import {
  IdMethods,
  IDAzureAdMethod,
  IDAzureAdB2cMethod,
  IDFacebookMethod,
  IdMethodName,
  IdMethodData,
} from './types';

export const getAzureConfig = (idMethods?: IdMethods) => {
  const azureAdConfig = idMethods?.data.find(
    (idMethod) => idMethod.attributes.name === 'azureactivedirectory'
  ) as IDAzureAdMethod | undefined;

  return azureAdConfig;
};

export const getAzureB2cConfig = (idMethods?: IdMethods) => {
  const azureAdB2cConfig = idMethods?.data.find(
    (idMethod) => idMethod.attributes.name === 'azureactivedirectory_b2c'
  ) as IDAzureAdB2cMethod | undefined;

  return azureAdB2cConfig;
};

export const getFacebookConfig = (idMethods?: IdMethods) => {
  const facebookConfig = idMethods?.data.find(
    (method): method is IDFacebookMethod =>
      method.attributes.name === 'facebook'
  );

  return facebookConfig;
};

export function isLastIdMethod(
  idMethodName: IdMethodName,
  idMethods: IdMethodData[]
) {
  return (
    idMethods.map((vm) => vm.attributes.name).indexOf(idMethodName) ===
    idMethods.length - 1
  );
}
