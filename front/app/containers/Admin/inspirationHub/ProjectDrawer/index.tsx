import React from 'react';

import {
  Box,
  Text,
  Title,
  Button,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectLibraryProject from 'api/project_library_projects/useProjectLibraryProject';

import QuillEditedContent from 'components/UI/QuillEditedContent';
import SideModal from 'components/UI/SideModal';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import { useLocalizeProjectLibrary } from '../utils';

import Header from './Header';
import messages from './messages';
import Phase from './Phase';

const StyledBox = styled(Box)`
  font-size: ${fontSizes.base}px;
  height: 40px;

  &:focus {
    outline: 1px solid ${colors.primary};
    height: auto;
  }
`;

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
            <QuillEditedContent textColor={colors.textPrimary}>
              <div
                dangerouslySetInnerHTML={{
                  __html: localizeProjectLibrary(
                    attributes.description_multiloc,
                    attributes.description_en
                  ),
                }}
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
          <Box mt="32px">
            <Title variant="h3">External comments</Title>
            <StyledBox
              as="textarea"
              rows={5}
              width="100%"
              maxWidth="500px"
              border={`1px solid ${colors.borderDark}`}
              borderRadius={stylingConsts.borderRadius}
              p="10px"
              placeholder="Write your comment here"
            />
            <Box w="100%" mt="4px" display="flex">
              <Button w="auto">Post your comment</Button>
            </Box>
          </Box>
        </Box>
      )}
    </SideModal>
  );
};

export default ProjectDrawer;
