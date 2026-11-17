import React from 'react';

import {
  Box,
  IconTooltip,
  Input,
  Text,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IMapConfig } from 'api/map_config/types';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { getCenter, getZoomLevel } from 'utils/mapUtils/map';

import messages from '../messages';

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
    <Box display="flex" flexDirection="column" gap="16px">
      <Box as="h3" display="flex" alignItems="center" gap="4px" m="0">
        <Text as="span" variant="boLabel" color="coolGrey600" m="0">
          {formatMessage(messages.mapCenterAndZoom)}
        </Text>
        <IconTooltip
          content={formatMessage(messages.mapCenterAndZoomTooltip, {
            button: formatMessage(messages.saveZoom),
          })}
        />
      </Box>
      {fields.map(({ key, label, tooltip }) => (
        <Input
          key={key}
          id={`map-config-${key}`}
          type="text"
          variant="bo"
          value={values[key]}
          label={formatMessage(label)}
          labelTooltipText={formatMessage(tooltip)}
          onChange={(value) => onChange({ ...values, [key]: value })}
        />
      ))}
      {invalid && <Error text={formatMessage(messages.errorMessage)} />}
    </Box>
  );
};

export default StagedCenterAndZoom;
