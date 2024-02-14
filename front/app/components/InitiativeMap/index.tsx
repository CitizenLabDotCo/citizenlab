import React, { useCallback, useEffect, useMemo, useState } from 'react';

// components
import EsriMap from 'components/EsriMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import Popup from '@arcgis/core/widgets/Popup.js';
import StartInitiativeButton from './components/StartInitiativeButton';
import InitiativeInformationOverlay from './components/InitiativeInformationOverlay';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// hooks
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

// auth
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// utils
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';
import {
  changeCursorOnHover,
  getClusterConfiguration,
  getMapPinSymbol,
} from 'components/EsriMap/utils';
import { useSearchParams } from 'react-router-dom';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { IInitiativeData } from 'api/initiatives/types';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

// style
import styled, { useTheme } from 'styled-components';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

export interface Props {
  list: IInitiativeData[];
}

// Custom styling for Esri map
const StyledMapContainer = styled(Box)`
  calcite-action-bar {
    display: none;
  }
`;

const InitiativeMap = ({ list }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const initiativePermissions = useInitiativesPermissions('posting_initiative');

  // State variables
  const [clickedMapLocation, setClickedMapLocation] =
    useState<GeoJSON.Point | null>(null);
  const [selectedInitiative, setSelectedInitiative] = useState<string | null>(
    searchParams.get('selected_initiative_id') || null
  );

  useEffect(() => {
    if (searchParams.get('selected_initiative_id')) {
      removeSearchParams(['selected_initiative_id']);
    }
  }, [searchParams]);

  // Create a div element to use for inserting React components into Esri map popup
  // Docs: https://developers.arcgis.com/javascript/latest/custom-ui/#introduction
  const startInitiativeButtonNode = useMemo(() => {
    return document.createElement('div');
  }, []);

  // Loop through initatives with locations and create array of graphics
  const initiativesWithLocation = useMemo(() => {
    return list.filter(
      (initiative) => initiative?.attributes?.location_point_geojson
    );
  }, [list]);

  const graphics = useMemo(() => {
    return initiativesWithLocation?.map((initiative) => {
      return new Graphic({
        geometry: new Point({
          longitude:
            initiative?.attributes?.location_point_geojson?.coordinates[0],
          latitude:
            initiative?.attributes?.location_point_geojson?.coordinates[1],
        }),
        attributes: {
          initiativeId: initiative?.id,
        },
      });
    });
  }, [initiativesWithLocation]);

  // Create an Esri map layer from the graphics so we can add a cluster display
  const initiativesLayer = useMemo(() => {
    if (graphics) {
      return new FeatureLayer({
        source: graphics, // Array of initiative graphics
        title: 'Initiative pins',
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
          symbol: getMapPinSymbol({ color: theme.colors.tenantPrimary }),
        }),
        // Add cluster display to this layer
        featureReduction: getClusterConfiguration(theme.colors.tenantPrimary),
      });
    }
    return undefined;
  }, [graphics, theme.colors.tenantPrimary]);

  const onMapClick = useCallback(
    (event: any, mapView: MapView) => {
      // On map click, we either open an existing initiative OR show the "submit a proposal" popup
      // depending on whether the user has clicked an existing map feature.
      mapView.hitTest(event).then((result) => {
        const elements = result.results; // These are map elements underneath our map click
        if (elements.length > 0) {
          // User clicked an initiative pin OR a cluster
          elements.forEach((element) => {
            if (element.type === 'graphic') {
              const graphicId = element.graphic.attributes.ID;
              if (graphicId === undefined) {
                // User clicked a cluster. Zoom in on the cluster.
                mapView.goTo(
                  {
                    center: [
                      element.mapPoint.longitude,
                      element.mapPoint.latitude,
                    ],
                    zoom: mapView.zoom + 1,
                  },
                  {
                    duration: 1000,
                  }
                );
              } else {
                // User clicked an initiative pin. Zoom to pin & open the information panel.
                const initiativeId = graphics?.at(graphicId - 1)?.attributes
                  .initiativeId;

                if (initiativeId) {
                  mapView.goTo(
                    {
                      center: [
                        element.mapPoint.longitude,
                        element.mapPoint.latitude,
                      ],
                    },
                    { duration: 1000 }
                  );
                  setSelectedInitiative(initiativeId);
                }
              }
            }
          });
        } else {
          // User clicked elsewhere the map. Show the "submit a proposal" popup.
          mapView
            .goTo(
              {
                // Center the map on the clicked location (so the popup will always show nicely).
                center: [event.mapPoint.longitude, event.mapPoint.latitude],
              },
              { duration: 700 }
            )
            .then(() => {
              setClickedMapLocation({
                type: 'Point',
                coordinates: [
                  event.mapPoint.longitude,
                  event.mapPoint.latitude,
                ],
              });
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
              setSelectedInitiative(null);
              mapView.openPopup();
            });
        }
      });
    },
    [formatMessage, graphics, startInitiativeButtonNode]
  );

  const onNewInitiativeButtonClick = useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();

      // Get click coordinates
      const lat = clickedMapLocation?.coordinates[1];
      const lng = clickedMapLocation?.coordinates[0];

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
          updateSearchParams({ selected_initiative_id: selectedInitiative });
          clHistory.push(
            {
              pathname: `/initiatives/new`,
              search: clickedMapLocation
                ? stringify({ lat, lng }, { addQueryPrefix: true })
                : undefined,
            },
            { scrollToTop: true }
          );
        }
      }
    },
    [
      clickedMapLocation,
      initiativePermissions?.authenticationRequirements,
      initiativePermissions?.enabled,
      selectedInitiative,
    ]
  );

  return (
    <StyledMapContainer>
      <EsriMap
        height={isPhoneOrSmaller ? '480px' : '640px'}
        layers={initiativesLayer ? [initiativesLayer] : undefined}
        onClick={onMapClick}
        onHover={changeCursorOnHover}
      />
      <StartInitiativeButton
        modalPortalElement={startInitiativeButtonNode}
        onClick={() => {
          onNewInitiativeButtonClick();
        }}
      />
      <InitiativeInformationOverlay
        selectedInitiative={selectedInitiative}
        setSelectedInitiative={setSelectedInitiative}
      />
    </StyledMapContainer>
  );
};

export default InitiativeMap;
