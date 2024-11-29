import React, { useCallback, useMemo, useRef, useState } from 'react';

import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import MapView from '@arcgis/core/views/MapView';
import Popup from '@arcgis/core/widgets/Popup';
import { Box, colors, Text, Title } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { useTheme } from 'styled-components';

import { IProjects } from 'api/projects/types';

import EsriMap from 'components/EsriMap';
import {
  esriPointToGeoJson,
  getClusterConfiguration,
  getShapeSymbol,
  goToMapLocation,
} from 'components/EsriMap/utils';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import messages from './messages';
import { testingData } from './temp';
import VisitProjectButton from './VisitProjectButton';

const ProjectsMap = () => {
  const theme = useTheme();
  const projects = testingData as unknown as IProjects;
  const [esriMapView, setEsriMapview] = useState<MapView | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >(undefined);
  const projectTitleRef = useRef<string>('');

  const [clickedMapLocation, setClickedMapLocation] =
    useState<GeoJSON.Point | null>(null);

  const projectButtonNode = useMemo(() => {
    return document.createElement('div');
  }, []);

  // Create a point graphics list from question responses
  const graphics = useMemo(() => {
    return projects.data.map((project) => {
      const coordinates = project.attributes.location_geojson?.coordinates;

      return new Graphic({
        geometry: new Point({
          longitude: coordinates?.[0],
          latitude: coordinates?.[1],
        }),
        attributes: {
          projectId: project.id,
          projectSlug: project.attributes.slug,
        },
      });
    });
  }, [projects]);

  // Create an Esri feature layer from the projects
  const responsesLayer = useMemo(() => {
    return new FeatureLayer({
      source: graphics, // Array of idea graphics
      title: 'Layer title',
      id: 'ideasLayer',
      outFields: ['*'],
      objectIdField: 'ID',
      fields: [
        {
          name: 'ID',
          type: 'oid',
        },
        {
          name: 'projectId', // From the graphics attributes
          type: 'string',
        },
        {
          name: 'projectSlug', // From the graphics attributes
          type: 'string',
        },
      ],
      // Set the symbol used to render the graphics
      renderer: new Renderer({
        symbol: getShapeSymbol({
          shape: 'circle',
          color: theme.colors.tenantPrimary,
          outlineColor: colors.white,
          outlineWidth: 2,
          sizeInPx: 18,
        }),
      }),
      legendEnabled: false,
      // Add cluster display to this layer
      featureReduction: getClusterConfiguration(theme.colors.tenantPrimary),
      // Add a popup template which is used when multiple ideas share a single location
      popupTemplate: {
        title: 'Popup title',
        content: () => {
          return projectButtonNode;
        },
      },
    });
  }, [graphics, projectButtonNode, theme.colors.tenantPrimary]);

  const onMapInit = useCallback(
    (mapView: MapView) => {
      // Save the esriMapView in state
      if (!esriMapView) {
        setEsriMapview(mapView);
      }
    },
    [esriMapView]
  );

  const onMapClick = useCallback(
    (event: any, mapView: MapView) => {
      mapView.hitTest(event).then((result) => {
        // Get any map elements underneath map click
        const elements = result.results;
        if (elements.length > 0) {
          if (elements[0]['graphic']?.attributes.projectId) {
            setSelectedProjectId(elements[0]['graphic'].attributes.projectId);
            // OPEN POPUP --------------------------------------------
            goToMapLocation(esriPointToGeoJson(event.mapPoint), mapView).then(
              () => {
                // Save the clicked map location in state
                setClickedMapLocation(esriPointToGeoJson(event.mapPoint));

                // Create an Esri popup
                mapView.popup = new Popup({
                  collapseEnabled: true,
                  dockEnabled: true,

                  location: event.mapPoint,
                  title: projectTitleRef.current,
                });
                // Set content of the popup to the node we created (so we can insert our React component via a portal)
                mapView.popup.content = projectButtonNode;
                mapView.openPopup();
              }
            );
          }
        }
      });
    },
    [projectButtonNode]
  );

  return (
    <Box bg={colors.white} data-cy="e2e-projects" p="20px">
      <Box maxWidth="1200px" margin="0 auto" maxHeight="80vh">
        <Title mb="16px" m="0px" variant="h4">
          Discover our projects in your neighborhood!
        </Title>

        <EsriMap
          initialData={{
            onInit: onMapInit,
          }}
          onClick={onMapClick}
          layers={[responsesLayer]}
          height={'60vh'}
        />
      </Box>
      <VisitProjectButton
        modalPortalElement={projectButtonNode}
        latlng={clickedMapLocation}
        projectId={selectedProjectId}
        projectTitleRef={projectTitleRef}
      />
    </Box>
  );
};

const ProjectsSettings = () => {
  const {
    actions: { setProp },
    currentlyWorkingOnText,
  } = useNode((node) => ({
    currentlyWorkingOnText: node.data.props.currentlyWorkingOnText,
  }));
  return (
    <Box
      background="#ffffff"
      my="20px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <Text color="textSecondary">project description</Text>
      <InputMultilocWithLocaleSwitcher
        id="project_title"
        type="text"
        label={'label'}
        name="project_title"
        valueMultiloc={currentlyWorkingOnText}
        placeholder={'placeholder'}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.currentlyWorkingOnText = valueMultiloc))
        }
      />
    </Box>
  );
};

ProjectsMap.craft = {
  related: {
    settings: ProjectsSettings,
  },
};

export const projectsMapTitle = messages.projectsMapTitle;
export default ProjectsMap;
