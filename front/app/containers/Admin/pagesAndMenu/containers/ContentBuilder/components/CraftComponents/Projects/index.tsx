import React from 'react';

import { Box, colors, media, Text } from '@citizenlab/cl2-component-library';

import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import messages from './messages';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { useNode } from '@craftjs/core';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

const ProjectSection = styled.div`
  width: 100%;
  padding-top: 40px;
  padding-bottom: 40px;

  ${media.tablet`
    padding-bottom: 40px;
    padding-left: ${DEFAULT_PADDING};
    padding-right: ${DEFAULT_PADDING};
  `}
`;

const Projects = ({
  currentlyWorkingOnText,
}: {
  currentlyWorkingOnText?: Multiloc;
}) => {
  return (
    <Box bg={colors.background} data-cy="e2e-projects">
      <Box maxWidth="1200px" margin="0 auto">
        <ProjectSection id="e2e-landing-page-project-section">
          <ProjectAndFolderCards
            publicationStatusFilter={['published', 'archived']}
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

Projects.craft = {
  related: {
    settings: ProjectsSettings,
  },
  custom: {
    title: messages.projectsTitle,
    noPointerEvents: true,
    noDelete: true,
  },
};

export default Projects;
