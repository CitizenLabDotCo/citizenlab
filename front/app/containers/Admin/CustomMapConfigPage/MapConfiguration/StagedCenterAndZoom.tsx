import React from 'react';

import Banner from 'design-system/Banner';
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
  /** Edits not saved yet. The page's save button saves them. */
  staged: CenterAndZoomValues | null;
  invalid: boolean;
  onChange: (values: CenterAndZoomValues) => void;
}

const StagedCenterAndZoom = ({
  mapConfig,
  staged,
  invalid,
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
        {formatMessage(messages.stagedSaveZoomHelp, {
          button: formatMessage(messages.saveZoom),
        })}
      </Text>
      {invalid && (
        <Banner tone="error">
          {formatMessage(messages.invalidCenterAndZoom)}
        </Banner>
      )}
    </div>
  );
};

export default StagedCenterAndZoom;
