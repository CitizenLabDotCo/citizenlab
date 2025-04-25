import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectLibraryProject from 'api/project_library_projects/useProjectLibraryProject';

import ReadMoreWrapper from 'components/ReadMoreWrapper/ReadMoreWrapper';
import SideModal from 'components/UI/SideModal';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import { useLocalizeProjectLibrary } from '../utils';

import Comments from './Comments';
import Header from './Header';
import messages from './messages';
import Phase from './Phase';

const ProjectDrawer = () => {
  const [searchParams] = useSearchParams();
  const { data: appConfiguration } = useAppConfiguration();
  const { formatMessage } = useIntl();

  const projectId = searchParams.get('project_id') ?? undefined;
  const { data: project } = useProjectLibraryProject(projectId);
  const localizeProjectLibrary = useLocalizeProjectLibrary();

  const handleOnClose = () => {
    removeSearchParams(['project_id']);
  };

  const attributes = project?.data.attributes;
  const relationships = project?.data.relationships;

  const showOptOutCopy =
    appConfiguration &&
    attributes &&
    appConfiguration.data.id === attributes.tenant_id;

  return (
    <SideModal
      opened={!!project && !!projectId}
      close={handleOnClose}
      width="50%"
    >
      {attributes && (
        <Box mt="52px" mx="28px" pb="20px">
          <Header attributes={attributes} />
          {showOptOutCopy && (
            <Box mt="20px">
              <Warning>
                <Text m="0">{formatMessage(messages.optOutCopy)}</Text>
              </Warning>
            </Box>
          )}
          <Box mt="28px">
            <ReadMoreWrapper
              fontSize="base"
              content={
                <div
                  dangerouslySetInnerHTML={{
                    __html: localizeProjectLibrary(
                      attributes.description_multiloc,
                      attributes.description_en
                    ),
                  }}
                />
              }
            />
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
          <Box mt="32px">{projectId && <Comments projectId={projectId} />}</Box>
        </Box>
      )}
    </SideModal>
  );
};

export default ProjectDrawer;
