import React from 'react';

// components
import { Box, colors, media } from '@citizenlab/cl2-component-library';

// hooks
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import messages from './messages';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { useNode } from '@craftjs/core';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { useIntl } from 'utils/cl-intl';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

const ProjectSection = styled.div`
  width: 100%;
  padding-top: 40px;
  padding-bottom: 40px;

  ${media.phone`
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
    <Box bg={colors.background}>
      <Box maxWidth="1150px" margin="0 auto">
        <ProjectSection>
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
      my="40px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
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
