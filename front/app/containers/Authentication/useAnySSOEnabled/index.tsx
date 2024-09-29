import useFeatureFlag from 'hooks/useFeatureFlag';
import { useLocation } from 'react-router-dom';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

export function useSSOMethodsEnabled() {
  const { data: tenant } = useAppConfiguration();
  const tenantSettings = tenant?.data.attributes.settings;
  const { pathname } = useLocation();
  const showAdminOnlyMethods = pathname.endsWith('/sign-in/admin');

  return [
    useFeatureFlag({ name: 'fake_sso' }),
    useFeatureFlag({ name: 'google_login' }),
    useFeatureFlag({ name: 'facebook_login' }),
    useFeatureFlag({ name: 'azure_ad_login' }) &&
      (!tenantSettings?.azure_ad_login?.admin_only || showAdminOnlyMethods),
    useFeatureFlag({ name: 'azure_ad_b2c_login' }),
    useFeatureFlag({ name: 'franceconnect_login' }),
    useFeatureFlag({ name: 'vienna_citizen_login' }),
    useFeatureFlag({ name: 'clave_unica_login' }),
    useFeatureFlag({ name: 'hoplr_login' }),
    useFeatureFlag({ name: 'criipto_login' }),
    useFeatureFlag({ name: 'nemlog_in_login' }),
    useFeatureFlag({ name: 'bosa_fas_login' }),
  ];
}

export default function useAnySSOEnabled() {
  const methods = useSSOMethodsEnabled();
  return methods.some((x) => x);
}
