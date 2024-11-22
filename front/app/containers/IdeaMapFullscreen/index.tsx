import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import IdeasMap from 'components/IdeasMap';

const IdeaMapFullscreen = () => {
  const { phaseId, slug } = useParams() as {
    phaseId: string;
    slug: string;
  };
  const { data: project } = useProjectBySlug(slug);
  const projectId = project?.data.id;
  const loadIdeaMarkers = window.URL.toString().includes('fullscreen-map');

  const { data: mapConfig, isLoading } = useProjectMapConfig(projectId);

  const { data: ideaMarkers } = useIdeaMarkers(
    {
      projectIds: projectId ? [projectId] : null,
      phaseId,
    },
    loadIdeaMarkers
  );

  if (isLoading || !projectId) {
    return (
      <Box height="100vh">
        <Box mt="auto">
          <Spinner />
        </Box>
      </Box>
    );
  }

  return (
    <IdeasMap
      projectId={projectId}
      phaseId={phaseId}
      mapConfig={mapConfig}
      ideaMarkers={ideaMarkers}
      height="100vh"
    />
  );
};

export default IdeaMapFullscreen;
