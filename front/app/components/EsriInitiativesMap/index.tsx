import React, { useEffect, useRef } from 'react';

// components
import EsriMap from 'components/EsriMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import Popup from '@arcgis/core/widgets/Popup.js';
import StartInitiativeButton from './components/StartInitiativeButton';
import InitiativeInformation from './components/InitiativeInformation';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// hooks
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
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { IInitiativeData } from 'api/initiatives/types';

// style
import styled, { useTheme } from 'styled-components';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

export interface Props {
  center: GeoJSON.Point;
  list: IInitiativeData[];
}

// Esri CSS overrides
const StyledMapContainer = styled(Box)`
  calcite-action-bar {
    display: none;
  }

  #initiative-info-node {
    position: unset;
  }
`;

const EsriInitiativeMap = ({ center, list }: Props) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const theme = useTheme();

  const initiativePermissions = useInitiativesPermissions('posting_initiative');
  const clickedLocationRef = useRef<GeoJSON.Point | null>(null); // Stores the clicked map location

  // Check if the URL contains a selected initiative ID. Open the initiative preview if so.
  const initiativeIdFromUrl = searchParams.get('selected_initiative_id');
  useEffect(() => {
    if (initiativeIdFromUrl) {
      removeSearchParams(['selected_initiative_id']);
      eventEmitter.emit('initiativeSelectedEvent', initiativeIdFromUrl);
    }
  }, [initiativeIdFromUrl]);

  // Create two div elements to use for inserting React components into Esri map popup and overlay
  // Docs: https://developers.arcgis.com/javascript/latest/custom-ui/#introduction
  const startInitiativeButtonNode = document.createElement('div');
  const initiativeInfoNode = document.createElement('div');
  initiativeInfoNode.id = 'initiative-info-node';

  // Loop through initative markers and create array of graphics
  const markersWithLocation = list.filter(
    (marker) => marker?.attributes?.location_point_geojson
  );
  const graphics = markersWithLocation?.map((marker) => {
    return new Graphic({
      geometry: new Point({
        longitude: marker?.attributes?.location_point_geojson?.coordinates[0],
        latitude: marker?.attributes?.location_point_geojson?.coordinates[1],
      }),
      attributes: {
        initiativeId: marker?.id,
      },
    });
  });

  // Create an Esri Layer from the graphics
  const initiativesLayer = graphics
    ? new FeatureLayer({
        source: graphics, // Array of initiative graphics
        title: 'Initiative markers',
        objectIdField: 'ID',
        fields: [
          {
            name: 'ID',
            type: 'oid',
          },
          {
            name: 'initiativeId', // From the graphics attributes
            type: 'string',
          },
        ],
        // Set the symbol used to render the graphics
        renderer: new Renderer({
          symbol: getMapPinSymbol(theme.colors.tenantPrimary),
        }),
        // Add cluster display to this layer
        featureReduction: getClusterConfiguration(theme.colors.tenantPrimary),
      })
    : undefined;

  const onMapClick = (event: any, mapView: MapView) => {
    // On map click, we either open an existing initiative or show the "submit a proposal" popup
    mapView.hitTest(event).then((result) => {
      const elements = result.results; // These are elements under our map click
      if (elements.length > 0) {
        // User clicked an initiative marker OR cluster
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
              const initiativeId = graphics?.at(graphicId - 1)?.attributes
                .initiativeId;
              if (initiativeId) {
                mapView.goTo({
                  center: [
                    element.mapPoint.longitude,
                    element.mapPoint.latitude,
                  ],
                });
                // Emit an event so we show the selected initiative's information
                eventEmitter.emit('initiativeSelectedEvent', initiativeId);
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
            // Create an Esri popup
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
            // Set content of the popup to the node we created (so we can insert our React component via a portal)
            mapView.popup.content = startInitiativeButtonNode;
            // Close any open UI elements and open the popup
            eventEmitter.emit('initiativeSelectedEvent', null);
            mapView.openPopup();
          });
      }
    });
  };

  const onNewInitiativeClick = (event?: React.FormEvent) => {
    event?.preventDefault();

    // Get click coordinates
    const lat = clickedLocationRef?.current?.coordinates[1];
    const lng = clickedLocationRef?.current?.coordinates[0];

    // Check permissions
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
        // Otherwise, redirect to the initiative form
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
        uiElements={[{ element: initiativeInfoNode, position: 'manual' }]}
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
};

export default EsriInitiativeMap;
