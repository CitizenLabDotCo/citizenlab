import React from 'react';

import { Box, media, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import { DEFAULT_Y_PADDING } from '../constants';

import messages from './messages';

const ProjectSection = styled.div`
  width: 100%;
  padding-top: ${DEFAULT_Y_PADDING};
  padding-bottom: ${DEFAULT_Y_PADDING};

  ${media.tablet`
    padding-left: ${DEFAULT_PADDING};
    padding-right: ${DEFAULT_PADDING};
  `}
`;

const ProjectsAndFoldersLegacy = ({
  currentlyWorkingOnText,
}: {
  currentlyWorkingOnText?: Multiloc;
}) => {
  return (
    <Box data-cy="e2e-projects">
      <Box maxWidth="1200px" margin="0 auto">
        <ProjectSection id="e2e-landing-page-project-section">
          <ProjectAndFolderCards
            showTitle={true}
            layout="dynamic"
            currentlyWorkingOnText={currentlyWorkingOnText}
          />
        </ProjectSection>
      </Box>
    </Box>
  );
};

const ProjectsSettings = () => {
  const { formatMessage } = useIntl();
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
      <Text color="textSecondary">
        <FormattedMessage
          {...messages.projectsDescription}
          values={{
            link: (
              <Link to="/admin/projects" target="_blank">
                <FormattedMessage {...messages.projectsDescriptionLink} />
              </Link>
            ),
          }}
        />
      </Text>
      <InputMultilocWithLocaleSwitcher
        id="project_title"
        type="text"
        label={formatMessage(messages.projectTitleLabel)}
        name="project_title"
        valueMultiloc={currentlyWorkingOnText}
        placeholder={formatMessage(messages.projectsTitlePlaceholder)}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.currentlyWorkingOnText = valueMultiloc))
        }
      />
    </Box>
  );
};

ProjectsAndFoldersLegacy.craft = {
  related: {
    settings: ProjectsSettings,
  },
};

export const projectsAndFoldersLegacyTitle = messages.projectsTitle;

export default ProjectsAndFoldersLegacy;
