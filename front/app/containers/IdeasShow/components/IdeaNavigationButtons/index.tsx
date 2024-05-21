import React, { useEffect, useState } from 'react';

import { Box, Text, Button } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';

type Props = {
  projectId: string;
};

const IdeaNavigationButtons = ({ projectId }: Props) => {
  const { slug } = useParams() as { slug: string };
  const { data: idea } = useIdeaBySlug(slug);

  const [searchParams] = useSearchParams();
  const phaseContext = searchParams.get('phase_context');

  const { data: ideaMarkers } = useIdeaMarkers({
    projectIds: [projectId],
    phaseId: phaseContext || undefined,
  });

  const [ideaIndex, setIdeaIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    const index = ideaMarkers?.data.findIndex(
      (marker) => marker.id === idea?.data.id
    );

    if (typeof index === 'number' && index !== -1) {
      setIdeaIndex(index + 1); // Add 1 so the count in the UI displays correctly
    }
  }, [idea?.data.id, ideaMarkers?.data]);

  return (
    <Box alignContent="center" display="flex" justifyContent="space-between">
      <Button
        px="12px"
        iconSize="16px"
        icon="chevron-left"
        buttonStyle="secondary-outlined"
      />
      <Text color="coolGrey600">
        {ideaIndex}/{ideaMarkers?.data.length}
      </Text>
      <Button
        px="12px"
        iconSize="16px"
        icon="chevron-right"
        buttonStyle="secondary-outlined"
      />
    </Box>
  );
};

export default IdeaNavigationButtons;
