import React, { useCallback, useMemo, useState } from 'react';
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
import DesktopTabletView from './Desktop/DesktopTabletView';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { getSubtextElement } from '../controlUtils';
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';
import MobileView from './Mobile/MobileView';
import useMapConfigById from 'api/map_config/useMapConfigById';
import { useParams } from 'react-router-dom';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import MapView from '@arcgis/core/views/MapView';
import { parseLayers } from 'components/EsriMap/utils';
import useLocalize from 'hooks/useLocalize';

const PointControl = ({ ...props }: ControlProps) => {
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

  // Handle when the data (point) changes
  const handlePointChange = useCallback(
    (point?: GeoJSON.Point) => {
      handleChange(path, point);
      setDidBlur(true);
    },
    [handleChange, path]
  );

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
            <Box my="auto">
              {isTabletOrSmaller
                ? formatMessage(messages.tapOnMapToAdd)
                : formatMessage(messages.clickOnMapToAdd)}
            </Box>
          </Box>
        </Label>
      </Box>
      {isLoadingMapConfig && uischema.options?.map_config_id && <Spinner />}
      {isMobileOrSmaller ? (
        <MobileView
          mapConfig={mapConfig}
          mapLayers={mapLayers}
          onMapInit={onMapInit}
          mapView={mapView}
          handlePointChange={handlePointChange}
          didBlur={didBlur}
          setDidBlur={setDidBlur}
          {...props}
        />
      ) : (
        <DesktopTabletView
          mapConfig={mapConfig}
          mapLayers={mapLayers}
          onMapInit={onMapInit}
          mapView={mapView}
          handlePointChange={handlePointChange}
          didBlur={didBlur}
          {...props}
        />
      )}
    </>
  );
};

export default withJsonFormsControlProps(PointControl);

export const pointControlTester = (uischema) => {
  if (uischema?.options?.input_type === 'point') {
    return 1000;
  }
  return -1;
};
