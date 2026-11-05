import { TAppConfigurationSetting } from 'api/app_configuration/types';
import useAuthUser from 'api/me/useAuthUser';

const useEarlyAccess = (feature: TAppConfigurationSetting) => {
  const { data: authUser } = useAuthUser();
  const attributes = authUser?.data.attributes;
  const tier = attributes?.offered_early_access_features?.[feature];
  const offered = !!tier;

  return {
    offered,
    tier,
    // A stored opt-in only counts while the feature is still offered, same as the backend.
    optedIn: offered && !!attributes.early_access_opt_ins?.includes(feature),
  };
};

export default useEarlyAccess;
