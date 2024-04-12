import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import MapView from '@arcgis/core/views/MapView';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';
import { useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { IInitiativeData } from 'api/initiatives/types';

import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import EsriMap from 'components/EsriMap';
import {
  changeCursorOnHover,
  esriPointToGeoJson,
  getClusterConfiguration,
  getMapPinSymbol,
  goToMapLocation,
  showAddInputPopup,
} from 'components/EsriMap/utils';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import InitiativeInformationOverlay from './components/InitiativeInformationOverlay';
import StartInitiativeButton from './components/StartInitiativeButton';
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

  const layers = useMemo(() => {
    return initiativesLayer ? [initiativesLayer] : undefined;
  }, [initiativesLayer]);

  const onMapClick = useCallback(
    (event: any, mapView: MapView) => {
      // Save clicked location
      setClickedMapLocation(esriPointToGeoJson(event.mapPoint));

      // On map click, we either open an existing initiative OR show the "submit a proposal" popup
      // depending on whether the user has clicked an existing map feature.
      mapView.hitTest(event).then((result) => {
        const elements = result.results; // These are map elements underneath our map click
        if (elements.length > 0) {
          const topElement = elements[0];
          // User clicked an initiative pin OR a cluster
          if (topElement.type === 'graphic') {
            const graphicId = topElement.graphic.attributes.ID;
            const clusterCount = topElement.graphic.attributes.cluster_count;
            if (clusterCount) {
              // User clicked a cluster. Zoom in on the cluster.
              goToMapLocation(
                esriPointToGeoJson(topElement.mapPoint),
                mapView,
                mapView.zoom + 2
              );
              return;
            } else if (graphicId) {
              // User clicked an initiative pin. Zoom to pin & open the information panel.
              const initiativeId = graphics?.at(graphicId - 1)?.attributes
                .initiativeId;

              if (initiativeId) {
                goToMapLocation(
                  esriPointToGeoJson(topElement.mapPoint),
                  mapView
                ).then(() => {
                  setSelectedInitiative(initiativeId);
                });
              }
              return;
            }
          }
        }
        // Show the "submit a proposal" popup.
        showAddInputPopup({
          event,
          mapView,
          setSelectedInput: setSelectedInitiative,
          popupContentNode: startInitiativeButtonNode,
          popupTitle: formatMessage(messages.startProposalAtLocation),
        });
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
        layers={layers}
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
