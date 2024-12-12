import React, { useCallback, useMemo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  Icon,
  Label,
  Spinner,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { useParams } from 'react-router-dom';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import useLocalize from 'hooks/useLocalize';

import { parseLayers } from 'components/EsriMap/utils';
import { FormLabel } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import { getSubtextElement } from '../controlUtils';
import messages from '../messages';

import DesktopTabletView from './Desktop/DesktopTabletView';
import MobileView from './Mobile/MobileView';
import { convertCoordinatesToGeoJSON } from './multiPointUtils';

const MapControl = ({ ...props }: ControlProps) => {
  const { uischema, path, id, schema, required, handleChange } = props;

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const isMobileOrSmaller = useBreakpoint('phone');
  const isTabletOrSmaller = useBreakpoint('tablet');
  const [didBlur, setDidBlur] = useState(false);

  // State variables
  const [mapView, setMapView] = useState<MapView | null>(null);

  // Get Project
  const { slug } = useParams() as {
    slug: string;
  };
  const { data: project } = useProjectBySlug(slug);

  // Get map configuration to use for this question
  const { data: customMapConfig, isLoading: isLoadingMapConfig } =
    useMapConfigById(uischema.options?.map_config_id);
  const { data: projectMapConfig } = useProjectMapConfig(project?.data.id);

  // If we dont have a custom map config, fall back to the project map config
  const mapConfig = uischema.options?.map_config_id
    ? customMapConfig
    : projectMapConfig;

  // Create map layers from map configuration to load in
  const mapLayers = useMemo(() => {
    return parseLayers(mapConfig, localize);
  }, [localize, mapConfig]);

  // On mapInit, persist the mapView in state
  const onMapInit = useCallback((mapView: MapView) => {
    setMapView(mapView);
  }, []);

  // Handler for when single point data changes
  const handleSinglePointChange = useCallback(
    (point?: GeoJSON.Point) => {
      handleChange(path, point);
      setDidBlur(true);
    },
    [handleChange, path]
  );

  // Handler for when multiple point data changes (line/polygon)
  const handleMultiPointChange = useCallback(
    (coordinates?: number[][]) => {
      if (coordinates) {
        const geoJSONObject = convertCoordinatesToGeoJSON(
          coordinates,
          uischema
        );
        handleChange(path, geoJSONObject);
      } else {
        handleChange(path, undefined);
      }
      setDidBlur(true);
    },
    [handleChange, path, uischema]
  );

  const getInstructionMessage = () => {
    if (isTabletOrSmaller) {
      return uischema.options?.input_type === 'point'
        ? formatMessage(messages.tapOnMapToAddOrType)
        : formatMessage(messages.tapOnMapMultipleToAdd);
    } else {
      return uischema.options?.input_type === 'point'
        ? formatMessage(messages.clickOnMapToAddOrType)
        : formatMessage(messages.clickOnMapMultipleToAdd);
    }
  };

  return (
    <>
      <Box>
        <FormLabel
          htmlFor={sanitizeForClassname(id)}
          labelValue={getLabel(uischema, schema, path)}
          optional={!required}
          subtextValue={getSubtextElement(uischema.options?.description)}
          subtextSupportsHtml
        />
        <Label>
          <Box display="flex">
            <Icon name="info-outline" fill={colors.coolGrey600} mr="4px" />
            <Box my="auto">{getInstructionMessage()}</Box>
          </Box>
        </Label>
      </Box>
      {isLoadingMapConfig && uischema.options?.map_config_id && <Spinner />}
      {isMobileOrSmaller ? (
        <MobileView
          mapConfig={mapConfig}
          onMapInit={onMapInit}
          mapView={mapView}
          handleSinglePointChange={handleSinglePointChange}
          handleMultiPointChange={handleMultiPointChange}
          didBlur={didBlur}
          inputType={uischema.options?.input_type}
          {...props}
        />
      ) : (
        <DesktopTabletView
          mapConfig={mapConfig}
          mapLayers={mapLayers}
          inputType={uischema.options?.input_type}
          onMapInit={onMapInit}
          mapView={mapView}
          handleSinglePointChange={handleSinglePointChange}
          didBlur={didBlur}
          handleMultiPointChange={handleMultiPointChange}
          {...props}
        />
      )}
    </>
  );
};

export default withJsonFormsControlProps(MapControl);

export const mapControlTester = (uischema) => {
  if (
    uischema?.options?.input_type === 'point' ||
    uischema?.options?.input_type === 'polygon' ||
    uischema?.options?.input_type === 'line'
  ) {
    return 1000;
  }

  return -1;
};
