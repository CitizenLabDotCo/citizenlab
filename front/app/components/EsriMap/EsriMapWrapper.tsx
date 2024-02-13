import React from 'react';
import EsriMap, { EsriMapProps } from '.';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

const EsriMapWrapper = (props: EsriMapProps) => {
  const { data: appConfig } = useAppConfiguration();
  const globalMapSettings = appConfig?.data.attributes.settings.maps;

  if (globalMapSettings) {
    return <EsriMap globalMapSettings={globalMapSettings} {...props} />;
  }

  return null;
};

export default EsriMapWrapper;
