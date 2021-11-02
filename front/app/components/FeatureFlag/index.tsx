import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';
// services
import { TAppConfigurationSetting } from 'services/appConfiguration';

interface Props {
  name: TAppConfigurationSetting;
  /** when this flag is set the feature will show if it's allowed,
      regardless of whether it's enabled. Useful for e.g. feature
      toggles */
  onlyCheckAllowed?: boolean;
}

const FeatureFlag: React.FC<Props> = ({ name, onlyCheckAllowed, children }) => {
  const show = useFeatureFlag({ name, onlyCheckAllowed });

  if (show && children) {
    return <>{children}</>;
  }

  return null;
};

export default FeatureFlag;
