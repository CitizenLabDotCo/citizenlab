import React from 'react';

import { Button, Text, Box } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';

import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

type Props = {
  modalPortalElement: HTMLDivElement;
  latlng: GeoJSON.Point | null;
  projectId?: string;
  projectTitleRef?: React.MutableRefObject<string>;
};

const VisitProjectButton = ({
  modalPortalElement,
  projectTitleRef,
  latlng,
  projectId,
}: Props) => {
  const localize = useLocalize();
  const { data: project } = useProjectById(projectId);
  const projectUrl = project ? `/projects/${project.data.attributes.slug}` : '';
  const projectTitle = localize(project?.data.attributes.title_multiloc);
  const projectDescription = localize(
    project?.data.attributes.description_preview_multiloc
  );
  if (projectTitleRef) {
    projectTitleRef.current = projectTitle;
  }

  // A portal is needed here as we're inserting our React component into the Esri Map popup as its content
  return createPortal(
    <Box maxHeight="400px" overflowY="auto">
      <Text fontSize="s">{projectDescription}</Text>
      <Button
        onClick={() => {
          window.open(projectUrl, '_blank');
        }}
      >
        Visit project!
      </Button>
    </Box>,
    modalPortalElement
  );
};

export default VisitProjectButton;
