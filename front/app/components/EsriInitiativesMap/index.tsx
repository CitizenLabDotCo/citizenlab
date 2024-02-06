import React, { memo, useRef, useState } from 'react';

// components
import EsriMap from 'components/EsriMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import Popup from '@arcgis/core/widgets/Popup.js';
import StartProposalButton from './StartProposalButton';

// hooks
import useInitiativeMarkers from 'api/initiative_markers/useInitiativeMarkers';
import {
  getClusterConfiguration,
  getMapPinSymbol,
} from 'components/EsriMap/utils';
import { useTheme } from 'styled-components';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// utils
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import ProposalInformation from './ProposalInformation';

export interface Props {
  center: GeoJSON.Point;
}

const EsriInitiativeMap = memo<Props>(({ center }: Props) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const { data: initiativeMarkers } = useInitiativeMarkers();
  const initiativePermissions = useInitiativesPermissions('posting_initiative');
  const clickedLocationRef = useRef<GeoJSON.Point | null>(null);
  const isPhoneOrSmaller = useBreakpoint('phone');

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    null
  );

  // Create a div element to use for inserting the "Start Proposal" button into the popup
  const startProposalButtonNode = document.createElement('div');
  const proposalInfoNode = document.createElement('div');

  // Loop through the initative markers and create a list of graphics
  const graphics = initiativeMarkers?.data.map((marker) => {
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

  // Create a FeatureLayer using the graphics
  const proposalsLayer = new FeatureLayer({
    source: graphics, // The array of graphics
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
  });

  // On map click, either open an existing proposal, or create a new marker and show the "submit a proposal" popup
  const onClick = (event: any, mapView: MapView) => {
    mapView.hitTest(event).then((result) => {
      const elements = result.results;
      if (elements.length > 0) {
        // User clicked a marker or cluster
        elements.forEach((element) => {
          if (element.type === 'graphic') {
            if (element.graphic.attributes.ID === undefined) {
              // User clicked a cluster
              mapView.goTo({
                center: [element.mapPoint.longitude, element.mapPoint.latitude],
                zoom: mapView.zoom + 1,
              });
            } else {
              // User clicked a proposal marker
              const id = graphics?.at(element.graphic.attributes.ID)?.attributes
                .markerId;
              if (id) {
                setSelectedProposalId(id);
                if (proposalInfoNode) {
                  mapView.ui.add(proposalInfoNode, 'top-right');
                }
              }
            }
          }
        });
      } else {
        // If the user clicked elsewhere the map, show the "submit a proposal" popup
        mapView.goTo({
          center: [event.mapPoint.longitude, event.mapPoint.latitude],
        });

        setTimeout(() => {
          mapView.popup = {
            collapseEnabled: false,
            dockEnabled: false,
            dockOptions: {
              buttonEnabled: false,
              breakpoint: false,
            },
            location: event.mapPoint,
            title: formatMessage(messages.startProposalAtLocation),
          } as Popup;
          mapView.popup.content = startProposalButtonNode;
          mapView.openPopup();
          clickedLocationRef.current = {
            type: 'Point',
            coordinates: [event.mapPoint.longitude, event.mapPoint.latitude],
          };
        }, 300);
      }
    });
  };

  // On map hover, change the cursor to pointer if hovering over a marker
  const onHover = (event: any, mapView: MapView) => {
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

  const onNewProposalButtonClick = (event?: React.FormEvent) => {
    event?.preventDefault();
    const lat = clickedLocationRef?.current?.coordinates[1];
    const lng = clickedLocationRef?.current?.coordinates[0];

    if (initiativePermissions?.enabled) {
      if (initiativePermissions?.authenticationRequirements) {
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
        // Redirect to proposal form
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
    <>
      <EsriMap
        center={center}
        height={isPhoneOrSmaller ? '480px' : '640px'}
        onClick={onClick}
        onHover={onHover}
        layers={[proposalsLayer]}
      />
      <StartProposalButton
        modalPortalElement={startProposalButtonNode}
        onClick={() => {
          onNewProposalButtonClick();
        }}
      />
      <ProposalInformation
        modalPortalElement={proposalInfoNode}
        selectedProposalId={selectedProposalId}
        onClick={() => {
          onNewProposalButtonClick();
        }}
      />
    </>
  );
});

export default EsriInitiativeMap;
