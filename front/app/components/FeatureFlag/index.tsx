import React from 'react';
import GetFeatureFlag from 'resources/GetFeatureFlag';
// services
import { TAppConfigurationSetting } from 'services/appConfiguration';

interface Props {
  name: TAppConfigurationSetting;
}

const FeatureFlag: React.FC<Props> = ({ name, children }) => {
  return (
    <GetFeatureFlag name={name}>
      {(enabled) => {
        return enabled ? <>{children}</> : null;
      }}
    </GetFeatureFlag>
  );
};

/** @deprecated Use useFeatureFlag instead. */
export default FeatureFlag;
