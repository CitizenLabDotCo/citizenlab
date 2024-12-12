import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import { colors, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IIdeaMarkers } from 'api/idea_markers/types';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import {
  esriPointToGeoJson,
  getClusterConfiguration,
  getShapeSymbol,
  goToMapLocation,
} from 'components/EsriMap/utils';

import { MessageDescriptor } from 'utils/cl-intl';
import { FormatMessageValues } from 'utils/cl-intl/useIntl';

import messages from './messages';

// BELOW: Custom handling for idea map width
// Description: This was existing styling prior to Esri migration.
// TODO: Cleanup these styles

export const mapMarginDesktop = 70;
export const mapHeightDesktop = '83vh';
export const mapHeightMobile = '78vh';

export const getInnerContainerLeftMargin = (
  windowWidth: number,
  containerWidth: number
) => {
  const leftMargin =
    Math.round((windowWidth - containerWidth) / 2) - mapMarginDesktop;
  return leftMargin > 0 ? leftMargin : null;
};

export const initialWindowWidth = Math.max(
  document.documentElement.clientWidth || 0,
  window.innerWidth || 0
);
export const initialContainerWidth =
  document.getElementById('e2e-ideas-container')?.offsetWidth ||
  initialWindowWidth < maxPageWidth
    ? initialWindowWidth - 40
    : maxPageWidth;

export const initialInnerContainerLeftMargin = getInnerContainerLeftMargin(
  initialWindowWidth,
  initialContainerWidth
);

export const InnerContainer = styled.div<{
  leftMargin: number | null;
  isPostingEnabled: boolean;
}>`
  width: ${({ leftMargin }) =>
    leftMargin ? `calc(100vw - ${70 * 2}px)` : '100%'};
  margin-left: ${({ leftMargin }) =>
    leftMargin ? `-${leftMargin}px` : 'auto'};
  position: relative;

  @media screen and (min-width: 2000px) {
    width: 1800px;
    margin-left: -${(1800 - maxPageWidth) / 2}px;
  }

  > .create-idea-wrapper {
    display: none;
  }

  .activeArea {
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    left: 500px;
  }

  & .pbAssignBudgetControlContainer {
    padding: 20px;
    background: ${colors.background};
  }

  ${media.tablet`
      .activeArea {
        left: 0px;
      }
    `}
`;

// Generate Esri point graphics from the ideaMarkers
export const generateIdeaMapGraphics = (
  ideaMarkers: IIdeaMarkers | undefined
) => {
  // Filter out ideas without location
  const ideasWithLocations = ideaMarkers?.data.filter(
    (idea) => idea.attributes.location_point_geojson
  );
  // Generate Esri point graphics
  return ideasWithLocations?.map((idea) => {
    const coordinates = idea.attributes.location_point_geojson?.coordinates;
    return new Graphic({
      geometry: new Point({
        longitude: coordinates?.[0],
        latitude: coordinates?.[1],
      }),
      attributes: {
        ideaId: idea.id,
      },
    });
  });
};

type GenerateFeatureLayerProps = {
  FeatureLayer: any;
  graphics: __esri.Graphic[];
  ideaIcon: __esri.SimpleMarkerSymbol;
  ideaIconSelected: __esri.SimpleMarkerSymbol;
  ideasAtLocationNode: HTMLDivElement;
  theme: any;
  formatMessage: (
    messageDescriptor: MessageDescriptor,
    values?: FormatMessageValues
  ) => string;
};

// Generate Esri feature layer for idea graphics
export const generateIdeaFeatureLayer = ({
  graphics,
  formatMessage,
  ideaIcon,
  ideasAtLocationNode,
  theme,
}: GenerateFeatureLayerProps) => {
  return new FeatureLayer({
    source: graphics, // Array of idea graphics
    title: formatMessage(messages.userInputs),
    id: 'ideasLayer',
    outFields: ['*'],
    objectIdField: 'ID',
    fields: [
      {
        name: 'ID',
        type: 'oid',
      },
      {
        name: 'ideaId', // From the graphics attributes
        type: 'string',
      },
    ],
    // Set the symbol used to render the graphics
    renderer: new Renderer({
      symbol: ideaIcon,
    }),
    legendEnabled: false,
    // Add cluster display to this layer
    featureReduction: getClusterConfiguration(theme.colors.tenantPrimary),
    // Add a popup template which is used when multiple ideas share a single location
    popupTemplate: {
      title: formatMessage(messages.multipleInputsAtLocation),
      content: () => {
        return ideasAtLocationNode;
      },
    },
  });
};

// Generate Esri circle icons for the idea map
export const getIdeaSymbol = (variant: 'primary' | 'selected', theme) => {
  if (variant === 'primary') {
    return getShapeSymbol({
      shape: 'circle',
      color: theme.colors.tenantPrimary,
      outlineColor: colors.white,
      outlineWidth: 2,
      sizeInPx: 18,
    });
  } else {
    return getShapeSymbol({
      shape: 'circle',
      color: theme.colors.tenantSecondary,
      outlineColor: colors.white,
      outlineWidth: 2,
      sizeInPx: 18,
    });
  }
};

type OpenSelectedIdeaProps = {
  ideaId: string;
  mapView: __esri.MapView;
  topElement: __esri.GraphicHit;
  ideaIconSelected: __esri.SimpleMarkerSymbol;
  setSelectedIdea: (ideaId: string | null) => void;
};

type IdeaSelectionProps = {
  ideaPoint: GeoJSON.Point;
  esriMapView: __esri.MapView;
  ideaIconSelected: __esri.SimpleMarkerSymbol;
  selectedIdeaId: string | null;
  setSelectedIdea: (ideaId: string | null) => void;
};
// Function to handle when an idea is selected from the ideas list
export const handleListIdeaSelection = ({
  esriMapView,
  ideaPoint,
  ideaIconSelected,
  setSelectedIdea,
  selectedIdeaId,
}: IdeaSelectionProps) => {
  goToMapLocation(ideaPoint, esriMapView).then(() => {
    // Create a graphic symbol to highlight the selected point
    const graphic = new Graphic({
      geometry: new Point({
        latitude: ideaPoint.coordinates[1],
        longitude: ideaPoint.coordinates[0],
      }),
      symbol: ideaIconSelected,
    });
    esriMapView.graphics.removeAll();
    // Show the graphic on the map for a few seconds to highlight the selected point
    esriMapView.graphics.add(graphic);
    setTimeout(() => {
      esriMapView.graphics.removeAll();
    }, 2000);

    setSelectedIdea(selectedIdeaId);
    return;
  });
};

// Function to open the selected idea panel view and highlight the clicked point
export const openSelectedIdeaPanel = ({
  ideaId,
  mapView,
  topElement,
  ideaIconSelected,
  setSelectedIdea,
}: OpenSelectedIdeaProps) => {
  goToMapLocation(esriPointToGeoJson(topElement.mapPoint), mapView).then(() => {
    setSelectedIdea(ideaId);
    // Add a graphic symbol to highlight which point was clicked
    const geometry = topElement.graphic.geometry;
    if (geometry.type === 'point') {
      const graphic = new Graphic({
        geometry,
        symbol: ideaIconSelected,
      });
      mapView.graphics.removeAll();

      // Add the graphic to the map for a few seconds to highlight the clicked point
      mapView.graphics.add(graphic);
      setTimeout(() => {
        mapView.graphics.removeAll();
      }, 2000);
    }
  });
};

type OpenSelectionPopupProps = {
  elements: __esri.ViewHit[];
  topElement: __esri.GraphicHit;
  mapView: __esri.MapView;
  setIdeasSharingLocation: (ideaIds: string[]) => void;
};

export const openIdeaSelectionPopup = ({
  setIdeasSharingLocation,
  topElement,
  mapView,
  elements,
}: OpenSelectionPopupProps) => {
  goToMapLocation(esriPointToGeoJson(topElement.mapPoint), mapView).then(() => {
    const ideaIds = elements.map((element) => {
      // Get list of idea ids at this location
      if (element.type === 'graphic') {
        const layerId = element.graphic.layer.id;
        const ideaId = element.graphic.attributes.ideaId;
        if (ideaId && layerId === 'ideasLayer') {
          return ideaId;
        }
      }
    });
    // Set state and open the idea selection popup
    setIdeasSharingLocation(ideaIds);
    mapView.popup.open({
      features: [topElement.graphic],
      location: topElement.mapPoint,
    });
  });
};
