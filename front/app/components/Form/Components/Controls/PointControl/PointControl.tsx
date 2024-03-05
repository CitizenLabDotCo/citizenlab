import React, { useCallback, useEffect, useMemo, useState } from 'react';

// components
import {
  Box,
  Icon,
  Label,
  Spinner,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from '../../ErrorDisplay';
import EsriMap from 'components/EsriMap';
import MapInputOverlay from './MapInputOverlay';
import LocationInput, { Option } from 'components/UI/LocationInput';

// utils
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { getSubtextElement } from '../controlUtils';
import { ControlProps } from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  esriPointToGeoJson,
  getMapPinSymbol,
  goToMapLocation,
  parseLayers,
} from 'components/EsriMap/utils';
import { geocode, reverseGeocode } from 'utils/locationTools';

// hooks
import { useTheme } from 'styled-components';
import useLocale from 'hooks/useLocale';
import { useParams } from 'react-router-dom';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import useMapConfigById from 'api/map_config/useMapConfigById';

// intl
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// types
import MapView from '@arcgis/core/views/MapView';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';

const PointControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  required,
  id,
}: ControlProps) => {
  const theme = useTheme();
  const locale = useLocale();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isMobileOrSmaller = useBreakpoint('phone');
  const isTabletOrSmaller = useBreakpoint('tablet');

  // Get project
  const { slug } = useParams() as {
    slug: string;
  };
  const { data: project } = useProjectBySlug(slug);

  // state variables
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [didBlur, setDidBlur] = useState(false);
  const [showMapOverlay, setShowMapOverlay] = useState(false);
  const [address, setAddress] = useState<Option>({
    value: '',
    label: '',
  });

  // Either get the custom map configuration or project level one
  const { data: customMapConfig, isLoading: isLoadingMapConfig } =
    useMapConfigById(uischema.options?.map_config_id);
  const { data: projectMapConfig } = useProjectMapConfig(project?.data.id);

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

  // When the data (point) changes, update the address and add a pin to the map
  useEffect(() => {
    if (data) {
      const point = data as GeoJSON.Point;

      // Set the address to the geocoded location
      reverseGeocode(point.coordinates[1], point.coordinates[0], locale).then(
        (location) => {
          setAddress({
            value: location || '',
            label: location || '',
          });
        }
      );

      // Create a graphic and add the point and symbol to it
      const graphic = new Graphic({
        geometry: new Point({
          longitude: point.coordinates[0],
          latitude: point.coordinates[1],
        }),
        symbol: getMapPinSymbol({
          color: theme.colors.tenantPrimary,
          sizeInPx: 44,
        }),
      });

      // Add a pin to the clicked location and delete any existing one
      if (mapView) {
        mapView.graphics.removeAll();
        mapView.graphics.add(graphic);
        goToMapLocation(point, mapView);
      }
    } else {
      setAddress({
        value: '',
        label: '',
      });
      mapView?.graphics.removeAll();
    }
  }, [data, locale, mapView, theme.colors.tenantPrimary]);

  const onMobileClickShowOverlay = useCallback(() => {
    setShowMapOverlay(true);
  }, []);

  const onDesktopMapClick = useCallback(
    (event: any, mapView: MapView) => {
      // Center the clicked location on the map
      goToMapLocation(esriPointToGeoJson(event.mapPoint), mapView).then(() => {
        // Update the form data
        handlePointChange(esriPointToGeoJson(event.mapPoint));
      });
    },
    [handlePointChange]
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
      <Box display="flex" flexDirection="column">
        <Box mb="12px">
          <LocationInput
            value={
              address.value && address.label
                ? {
                    value: address.value,
                    label: address.label,
                  }
                : null
            }
            onChange={(location: Option) => {
              // Geocode and save the location
              location?.value &&
                geocode(location.value).then((point) => {
                  point && handlePointChange(point);
                  return;
                });

              // Clear the point if the location is empty
              handlePointChange(undefined);
            }}
            placeholder={formatMessage(messages.addressInputPlaceholder)}
            aria-label={formatMessage(messages.addressInputAriaLabel)}
            className="e2e-idea-form-location-input-field"
          />
        </Box>
        {isLoadingMapConfig && uischema.options?.map_config_id && <Spinner />}
        {mapConfig && (
          <EsriMap
            height="400px"
            layers={mapLayers}
            initialData={{
              zoom: Number(mapConfig?.data.attributes.zoom_level),
              center: data || mapConfig?.data.attributes.center_geojson,
              showLegend: true,
              showLayerVisibilityControl: true,
              onInit: onMapInit,
            }}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
            onClick={
              isMobileOrSmaller ? onMobileClickShowOverlay : onDesktopMapClick
            }
          />
        )}
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
      {showMapOverlay && isMobileOrSmaller && (
        <MapInputOverlay setShowMapOverlay={setShowMapOverlay} />
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
