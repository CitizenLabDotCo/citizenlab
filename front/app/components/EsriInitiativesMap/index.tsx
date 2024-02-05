import React, { memo, useState } from 'react';

// components
import EsriMap from 'components/EsriMap';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import PopupTemplate from '@arcgis/core/PopupTemplate';
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

export interface Props {
  center: GeoJSON.Point;
}

const EsriInitiativeMap = memo<Props>(({ center }: Props) => {
  const theme = useTheme();
  const { data: initiativeMarkers } = useInitiativeMarkers();
  const initiativePermissions = useInitiativesPermissions('posting_initiative');
  const [clickedLocation, setClickedLocation] = useState<GeoJSON.Point | null>(
    null
  );
  const isPhoneOrSmaller = useBreakpoint('phone');

  // Create a div element to use for inserting the "Start Proposal" button into the popup
  const startProposalButtonNode = document.createElement('div');

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
                // Show information for the selected proposal
                const template = new PopupTemplate({
                  // autocasts as new PopupTemplate()
                  title: 'PROPOSAL TITLE',
                  content: 'PROPOSAL DESCRIPTION + BUTTON',
                });
                proposalsLayer.popupTemplate = template;
              }
            }
          }
        });
      } else {
        // If the user clicked elsewhere the map, show the "submit a proposal" popup
        // setClickedLocation({
        //   type: 'Point',
        //   coordinates: [event.mapPoint.longitude, event.mapPoint.latitude],
        // });
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
          } as Popup;
          mapView.popup.content = startProposalButtonNode;
          mapView.openPopup();
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

  //   const redirectToInitiativeForm = () => {
  //     const lat = clickedLocation?.coordinates[1];
  //     const lng = clickedLocation?.coordinates[0];
  //     clHistory.push(
  //       {
  //         pathname: `/initiatives/new`,
  //         search: clickedLocation
  //           ? stringify({ lat, lng }, { addQueryPrefix: true })
  //           : undefined,
  //       },
  //       { scrollToTop: true }
  //     );
  //   };

  //   const onNewInitiativeButtonClick = (event?: React.FormEvent) => {
  //     event?.preventDefault();
  //     const lat = clickedLocation?.coordinates[1];
  //     const lng = clickedLocation?.coordinates[0];

  //     if (initiativePermissions?.enabled) {
  //       if (initiativePermissions?.authenticationRequirements) {
  //         const context = {
  //           type: 'initiative',
  //           action: 'posting_initiative',
  //         } as const;

  //         const successAction: SuccessAction = {
  //           name: 'redirectToInitiativeForm',
  //           params: { lat, lng },
  //         };
  //         triggerAuthenticationFlow({
  //           flow: 'signup',
  //           context,
  //           successAction,
  //         });
  //       } else {
  //         redirectToInitiativeForm();
  //       }
  //     }
  //   };

  return (
    <>
      <EsriMap
        center={center}
        height={isPhoneOrSmaller ? '480px' : '640px'}
        onClick={onClick}
        onHover={onHover}
        layers={[proposalsLayer]}
      />
      {/* <Box id="customTextDiv">
        <InitiativePreview initiativeId={selectedInitiativeId} />
      </Box> */}
      <StartProposalButton
        modalPortalElement={startProposalButtonNode}
        onClick={() => {}}
      />
    </>
  );
});

export default EsriInitiativeMap;
