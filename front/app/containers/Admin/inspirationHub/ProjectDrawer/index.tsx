import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useProjectLibraryProject from 'api/project_library_projects/useProjectLibraryProject';

import QuillEditedContent from 'components/UI/QuillEditedContent';
import SideModal from 'components/UI/SideModal';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import Header from './Header';
import Phase from './Phase';

const ProjectDrawer = () => {
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get('project_id') ?? undefined;
  const { data: project } = useProjectLibraryProject(projectId);

  const handleOnClose = () => {
    removeSearchParams(['project_id']);
  };

  const attributes = project?.data.attributes;
  const relationships = project?.data.relationships;

  return (
    <SideModal opened={!!project && !!projectId} close={handleOnClose}>
      {attributes && (
        <Box mt="52px" mx="28px">
          <Header attributes={attributes} />
          <Box mt="28px">
            <QuillEditedContent textColor={colors.textPrimary}>
              <div
                dangerouslySetInnerHTML={{ __html: attributes.description_en }}
              />
            </QuillEditedContent>
          </Box>
          <Box mt="32px">
            {relationships?.phases.data.map(({ id }, index) => (
              <Phase
                key={id}
                projectLibraryPhaseId={id}
                phaseNumber={index + 1}
                projectAttributes={attributes}
              />
            ))}
          </Box>
        </Box>
      )}
    </SideModal>
  );
};

export default ProjectDrawer;
