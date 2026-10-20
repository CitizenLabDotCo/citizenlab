import {
  IdMethods,
  IDAzureAdMethod,
  IDAzureAdB2cMethod,
  IDFacebookMethod,
  IDOktaMethod,
  IDPublikMethod,
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

export const getPublikConfig = (idMethods?: IdMethods) => {
  const publikConfig = idMethods?.data.find(
    (method): method is IDPublikMethod => method.attributes.name === 'publik'
  );

  return publikConfig;
};

export const getOktaConfig = (idMethods?: IdMethods) => {
  const oktaConfig = idMethods?.data.find(
    (method): method is IDOktaMethod => method.attributes.name === 'okta'
  );

  return oktaConfig;
};

// The methods city staff sign in with. They can be hidden from residents and
// can force staff email domains to use them.
export const isEmployeeSsoMethod = (
  method: IdMethodData
): method is IDAzureAdMethod | IDOktaMethod =>
  method.attributes.name === 'azureactivedirectory' ||
  method.attributes.name === 'okta';

export const getEmployeeSsoConfigs = (idMethods?: IdMethods) =>
  idMethods?.data.filter(isEmployeeSsoMethod) ?? [];

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
