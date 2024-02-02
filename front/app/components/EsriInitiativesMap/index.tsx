import React, { memo } from 'react';

// components
import EsriMap from 'components/EsriMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';

// hooks
import useInitiativeMarkers from 'api/initiative_markers/useInitiativeMarkers';
import {
  getClusterConfiguration,
  getMapPinSymbol,
} from 'components/EsriMap/utils';
import { useTheme } from 'styled-components';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import InitiativePreview from 'components/InitiativesMap/InitiativePreview';

export interface Props {
  temp: string;
}

const EsriInitiativeMap = memo<Props>(({ temp }: Props) => {
  const theme = useTheme();
  const { data: initiativeMarkers } = useInitiativeMarkers();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const [selectedInitiativeMarkerId, setSelectedInitiativeMarkerId] =
    React.useState<string | null>(null);

  // Loop through the initative markers and create a list of graphics
  const graphics = initiativeMarkers?.data.map((marker) => {
    return new Graphic({
      geometry: new Point({
        longitude: marker?.attributes?.location_point_geojson?.coordinates[0],
        latitude: marker?.attributes?.location_point_geojson?.coordinates[1],
      }),
      attributes: {
        ID: marker?.id,
      },
    });
  });

  // Create a FeatureLayer from the graphics
  const proposalsLayer = new FeatureLayer({
    source: graphics, // The array of graphics
    title: 'Initiative markers',
    objectIdField: 'ID',
    fields: [
      {
        name: 'ID',
        type: 'oid',
      },
    ],
    // Set the symbol used to render the graphics
    renderer: new Renderer({
      symbol: getMapPinSymbol(theme.colors.tenantPrimary),
    }),
    // Add the clustering mechanism to this layer
    featureReduction: getClusterConfiguration(theme.colors.tenantPrimary),
  });

  // On map click, either open an existing proposal, or create a new marker and show the "submit a proposal" popup
  const onClick = (event: any, mapView: MapView) => {
    mapView.hitTest(event).then((result) => {
      if (result.results.length > 0) {
        result.results.forEach((r) => {
          // If the user clicked on a marker, open the proposal information
          if (r.type === 'graphic') {
            if (r.graphic.attributes.ID === undefined) {
              // Use clicked a cluster
              mapView.goTo({
                center: [r.mapPoint.longitude, r.mapPoint.latitude],
                zoom: mapView.zoom + 1,
              });
            } else {
              // Use clicked a marker
              const id = graphics?.at(4)?.attributes.ID;
              if (id) {
                setSelectedInitiativeMarkerId(id);
              }
            }
          }
        });
      } else {
        // If the user clicked on the map, show the "submit a proposal" popup

        console.log("Didn't click an existing graphic");
      }
    });
  };

  // On map hover, change the cursor to pointer if hovering over a marker
  const onHover = (event: any, mapView: MapView) => {
    const markers = {
      include: proposalsLayer,
    };
    mapView.hitTest(event).then((result) => {
      if (result.results.length > 0) {
        // Hovering over marker(s)
        result.results.forEach((r) => {
          if (r.type === 'graphic') {
            // Change cursor to pointer
            document.body.style.cursor = 'pointer';
          }
        });
      } else {
        document.body.style.cursor = 'auto';
      }
    });
  };

  // TEMP ----------------------------------------
  const centerPoint = {
    type: 'Point',
    coordinates: [4.350928, 50.85578659999999],
  } as GeoJSON.Point;

  return (
    <>
      <EsriMap
        center={centerPoint}
        height={isPhoneOrSmaller ? '480px' : '640px'}
        onClick={onClick}
        onHover={onHover}
        layers={[proposalsLayer]}
      />
      {selectedInitiativeMarkerId && (
        <InitiativePreview initiativeId={selectedInitiativeMarkerId} />
      )}
    </>
  );
});

export default EsriInitiativeMap;
