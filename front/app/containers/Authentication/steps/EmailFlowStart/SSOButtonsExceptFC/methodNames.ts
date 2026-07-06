import { IDAzureAdB2cMethod, IDAzureAdMethod, IDKeycloakMethod } from 'api/id_methods/types';
import useIdMethods from 'api/id_methods/useIdMethods';

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

  const azureAdSettings = idMethods?.data.find(
    (method) => method.attributes.name === 'azureactivedirectory'
  ) as IDAzureAdMethod | undefined;

  const azureAdB2cSettings = idMethods?.data.find(
    (method) => method.attributes.name === 'azureactivedirectory_b2c'
  ) as IDAzureAdB2cMethod | undefined;

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
    azureactivedirectory: azureAdSettings?.attributes.login_mechanism_name ?? '',
    azureactivedirectory_b2c: azureAdB2cSettings?.attributes.login_mechanism_name ?? '',
  };
};

export default useAuthMethodNames;
