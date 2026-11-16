import React from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IMapConfig } from 'api/map_config/types';

import Banner from 'design-system/Banner';
import IconButton from 'design-system/IconButton';
import TextField from 'design-system/TextField';

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
      tooltip: messages.centerLatLabelTooltip,
    },
    {
      key: 'lng',
      label: messages.lngLabel,
      tooltip: messages.centerLngLabelTooltip,
    },
    {
      key: 'zoom',
      label: messages.zoomLabel,
      tooltip: messages.zoomLabelTooltip,
    },
  ] as const;

  return (
    <div className={styles.centerAndZoom}>
      <h3 className={styles.centerAndZoomHeading}>
        <span className={styles.centerAndZoomTitle}>
          {formatMessage(messages.mapCenterAndZoom)}
        </span>
        <IconButton
          icon="info-16"
          size={24}
          aria-label={formatMessage(messages.mapCenterAndZoomTooltip, {
            button: formatMessage(messages.saveZoom),
          })}
        />
      </h3>
      {fields.map(({ key, label, tooltip }) => (
        <TextField
          key={key}
          label={
            <span className={styles.fieldLabel}>
              {formatMessage(label)}
              <IconButton
                icon="info-16"
                size={24}
                aria-label={formatMessage(tooltip)}
              />
            </span>
          }
          value={values[key]}
          onChange={(value) => onChange({ ...values, [key]: value })}
        />
      ))}
      {invalid && (
        <Banner tone="error">{formatMessage(messages.errorMessage)}</Banner>
      )}
    </div>
  );
};

export default StagedCenterAndZoom;
