import React, { memo, useRef } from 'react';

// components
import EsriMap from 'components/EsriMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import Popup from '@arcgis/core/widgets/Popup.js';
import StartInitiativeButton from './StartInitiativeButton';
import InitiativeInformation from './InitiativeInformation';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// hooks
import useInitiativeMarkers from 'api/initiative_markers/useInitiativeMarkers';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

// auth
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// utils
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';
import eventEmitter from 'utils/eventEmitter';
import {
  changeCursorOnHover,
  getClusterConfiguration,
  getMapPinSymbol,
} from 'components/EsriMap/utils';

// style
import styled, { useTheme } from 'styled-components';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

export interface Props {
  center: GeoJSON.Point;
}

// Esri CSS overrides
const StyledMapContainer = styled(Box)`
  calcite-action-bar {
    display: none;
  }

  .esri-ui-manual-container > .esri-component {
    position: auto !important;
  }
`;

const EsriInitiativeMap = memo<Props>(({ center }: Props) => {
  const { formatMessage } = useIntl();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const theme = useTheme();

  const { data: initiativeMarkers } = useInitiativeMarkers();
  const initiativePermissions = useInitiativesPermissions('posting_initiative');
  const clickedLocationRef = useRef<GeoJSON.Point | null>(null); // Stores the clicked map location

  // Create two div elements to use for inserting React components into Esri map popup and overlay
  const startInitiativeButtonNode = document.createElement('div');
  const initiativeInfoNode = document.createElement('div');

  // Loop through the initative markers and create a list of graphics
  const markersWithLocation = initiativeMarkers?.data.filter(
    (marker) => marker?.attributes?.location_point_geojson
  );
  const graphics = markersWithLocation?.map((marker) => {
    return new Graphic({
      geometry: new Point({
        longitude: marker?.attributes?.location_point_geojson?.coordinates[0],
        latitude: marker?.attributes?.location_point_geojson?.coordinates[1],
      }),
      attributes: {
        markerId: marker?.id,
      },
    });
  });

  // Create an Esri Layer from the graphics
  const initiativesLayer = graphics
    ? new FeatureLayer({
        source: graphics, // The array of initiative marker graphics
        title: 'Initiative markers',
        objectIdField: 'ID',
        fields: [
          {
            name: 'ID',
            type: 'oid',
          },
          {
            name: 'markerId',
            type: 'string',
          },
        ],
        // Set the symbol used to render the graphics
        renderer: new Renderer({
          symbol: getMapPinSymbol(theme.colors.tenantPrimary),
        }),
        // Add the clustering mechanism to this layer
        featureReduction: getClusterConfiguration(theme.colors.tenantPrimary),
      })
    : undefined;

  const onMapClick = (event: any, mapView: MapView) => {
    // On map click, we either open an existing initiative or show the "submit a proposal" popup
    mapView.hitTest(event).then((result) => {
      const elements = result.results; // These are the elements under our map click
      if (elements.length > 0) {
        // User clicked a marker or cluster
        elements.forEach((element) => {
          if (element.type === 'graphic') {
            const graphicId = element.graphic.attributes.ID;
            if (graphicId === undefined) {
              // User clicked a cluster. Zoom in on the cluster.
              mapView.goTo({
                center: [element.mapPoint.longitude, element.mapPoint.latitude],
                zoom: mapView.zoom + 1,
              });
            } else {
              // User clicked an initiative marker
              const id = graphics?.at(graphicId - 1)?.attributes.markerId;
              if (id) {
                mapView.goTo({
                  center: [
                    element.mapPoint.longitude,
                    element.mapPoint.latitude,
                  ],
                });
                // Emit an event to show the selected initiative's information
                eventEmitter.emit('initiativeSelectedEvent', id);
                if (initiativeInfoNode) {
                  // Add the initiative information node to the map
                  mapView.ui.add(initiativeInfoNode, 'manual');
                }
              }
            }
          }
        });
      } else {
        // User clicked elsewhere the map, so we show the "submit a proposal" popup
        mapView
          .goTo({
            // Center the map on the clicked location, so the popup will always show nicely
            center: [event.mapPoint.longitude, event.mapPoint.latitude],
          })
          .then(() => {
            clickedLocationRef.current = {
              type: 'Point',
              coordinates: [event.mapPoint.longitude, event.mapPoint.latitude],
            };
            // Create the Esri popup
            mapView.popup = new Popup({
              collapseEnabled: false,
              dockEnabled: false,
              dockOptions: {
                buttonEnabled: false,
                breakpoint: false,
              },
              location: event.mapPoint,
              title: formatMessage(messages.startProposalAtLocation),
            });
            // Set content of the popup to node we created so we can insert our React component via a portal
            mapView.popup.content = startInitiativeButtonNode;
            // Remove any other UI elements and open the popup
            eventEmitter.emit('initiativeSelectedEvent', null);
            mapView.openPopup();
          });
      }
    });
  };

  const onNewInitiativeClick = (event?: React.FormEvent) => {
    event?.preventDefault();
    const lat = clickedLocationRef?.current?.coordinates[1];
    const lng = clickedLocationRef?.current?.coordinates[0];

    if (initiativePermissions?.enabled) {
      if (initiativePermissions?.authenticationRequirements) {
        // If the user needs to be authenticated, trigger the authentication flow
        const context = {
          type: 'initiative',
          action: 'posting_initiative',
        } as const;

        const successAction: SuccessAction = {
          name: 'redirectToInitiativeForm',
          params: { lat, lng },
        };
        triggerAuthenticationFlow({
          flow: 'signup',
          context,
          successAction,
        });
      } else {
        // Redirect to the initiative form
        clHistory.push(
          {
            pathname: `/initiatives/new`,
            search: clickedLocationRef.current
              ? stringify({ lat, lng }, { addQueryPrefix: true })
              : undefined,
          },
          { scrollToTop: true }
        );
      }
    }
  };

  return (
    <StyledMapContainer>
      <EsriMap
        center={center}
        height={isPhoneOrSmaller ? '480px' : '640px'}
        onClick={onMapClick}
        onHover={changeCursorOnHover}
        layers={initiativesLayer ? [initiativesLayer] : undefined}
      />
      <StartInitiativeButton
        modalPortalElement={startInitiativeButtonNode}
        onClick={() => {
          onNewInitiativeClick();
        }}
      />
      <InitiativeInformation modalPortalElement={initiativeInfoNode} />
    </StyledMapContainer>
  );
});

export default EsriInitiativeMap;
