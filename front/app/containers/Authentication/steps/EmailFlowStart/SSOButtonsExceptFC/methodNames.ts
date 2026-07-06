import { IDKeycloakMethod } from 'api/id_methods/types';
import useIdMethods from 'api/id_methods/useIdMethods';

import { getAzureB2cConfig, getAzureConfig } from '../../../../../api/id_methods/utils';

const isDev = process.env.NODE_ENV === 'development';

/*
 * Single source of truth for the human-readable name of each authentication
 * method. Used both to label the SSO buttons ("Continue with {name}") and to
 * reference a method by name elsewhere (e.g. the verification warning that
 * tells the user which method(s) they can verify with). Keeping the names here
 * avoids duplicating these strings across the codebase.
 *
 * Some names are dynamic (configured per tenant), hence this is a hook.
 */
const useAuthMethodNames = () => {
  const { data: idMethods } = useIdMethods();

  const azureConfig = getAzureConfig(idMethods);
  const azureB2cConfig = getAzureB2cConfig(idMethods);

  const keycloakMethod = idMethods?.data.find(
    (method) => method.attributes.name === 'keycloak'
  ) as IDKeycloakMethod | undefined;

  return {
    franceconnect: 'FranceConnect',
    criipto: isDev ? 'MitID (Criipto)' : 'MitID',
    twoday: 'BankID eller Freja eID+',
    acm: 'Itsme®',
    id_austria: 'ID Austria',
    federa: 'SPID, CIE or CNS',
    fake_sso: 'Fake SSO',
    hoplr: 'Hoplr',
    google: 'Google',
    facebook: 'Facebook',
    clave_unica: 'ClaveÚnica',
    vienna_citizen: 'StandardPortal',
    keycloak: keycloakMethod?.attributes.method_metadata?.name ?? '',
    azureactivedirectory: azureConfig?.attributes.login_mechanism_name ?? '',
    azureactivedirectory_b2c: azureB2cConfig?.attributes.login_mechanism_name ?? '',
  };
};

export default useAuthMethodNames;
