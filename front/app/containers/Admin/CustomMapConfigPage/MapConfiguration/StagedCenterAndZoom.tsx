import React from 'react';

import Banner from 'design-system/Banner';
import Button from 'design-system/Button';
import Text from 'design-system/Text';
import TextField from 'design-system/TextField';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IMapConfig } from 'api/map_config/types';

import { useIntl } from 'utils/cl-intl';
import { getCenter, getZoomLevel } from 'utils/mapUtils/map';

import messages from '../messages';

import styles from './MapConfiguration.module.css';

export type CenterAndZoomValues = Record<'lat' | 'lng' | 'zoom', string>;

interface Props {
  mapConfig: IMapConfig;
  staged: CenterAndZoomValues | null;
  error?: 'invalid_values' | 'request_failed';
  onRetry: () => void;
  onChange: (values: CenterAndZoomValues) => void;
}

const StagedCenterAndZoom = ({
  mapConfig,
  staged,
  error,
  onRetry,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();

  const [lat, lng] = getCenter(undefined, appConfig?.data, mapConfig.data);
  const values = staged ?? {
    lat: lat.toString(),
    lng: lng.toString(),
    zoom: getZoomLevel(undefined, appConfig?.data, mapConfig.data).toString(),
  };

  const fields = [
    {
      key: 'lat',
      label: messages.latLabel,
    },
    {
      key: 'lng',
      label: messages.lngLabel,
    },
    {
      key: 'zoom',
      label: messages.zoomLabel,
    },
  ] as const;

  return (
    <div className={styles.centerAndZoom}>
      <Text as="h3" variant="uiStrong">
        {formatMessage(messages.mapCenterAndZoom)}
      </Text>
      {fields.map(({ key, label }) => (
        <div key={key} className={styles.fieldRow}>
          <Text as="span" variant="ui">
            {formatMessage(label)}
          </Text>
          <TextField
            aria-label={formatMessage(label)}
            value={values[key]}
            onChange={(value) => onChange({ ...values, [key]: value })}
          />
        </div>
      ))}
      <Text variant="small" tone="secondary">
        {formatMessage(messages.autoSaveZoomHelp, {
          button: formatMessage(messages.saveZoom),
        })}
      </Text>
      {error === 'invalid_values' && (
        <Banner tone="error">
          {formatMessage(messages.invalidCenterAndZoom)}
        </Banner>
      )}
      {error === 'request_failed' && (
        <Banner tone="error">
          {formatMessage(messages.mapPositionSaveFailed)}{' '}
          <Button variant="secondary" onPress={onRetry}>
            {formatMessage(messages.retryMapPositionSave)}
          </Button>
        </Banner>
      )}
    </div>
  );
};

export default StagedCenterAndZoom;
