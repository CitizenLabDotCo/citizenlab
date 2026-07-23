import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';

import useProjectFiles from 'api/project_files/useProjectFiles';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import FileAttachments from 'components/UI/FileAttachments';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

type Props = {
  children?: React.ReactNode;
};

const ProjectDescriptionSection: UserComponent<Props> = ({ children }) => {
  const padding = useCraftComponentDefaultPadding();
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const projectId = useWidgetProjectId();
  const { data: projectFiles } = useProjectFiles(projectId ?? null);

  return (
    <Box
      id="e2e-project-page-description-section"
      maxWidth={`${maxPageWidth}px`}
      margin="0 auto"
      px={padding}
      w="100%"
      minHeight={inEditor ? '40px' : undefined}
    >
      {children}
      {/* Temporary: show project attachments below the description on the
          citizen page until files are authored directly in the builder. */}
      {!inEditor && !!projectFiles?.data.length && (
        <Box maxWidth="750px" mt="24px">
          <FileAttachments files={projectFiles.data} />
        </Box>
      )}
    </Box>
  );
};

const DescriptionSectionSettings = () => (
  <Box my="20px">
    <Text color="textSecondary" fontSize="s">
      <FormattedMessage {...messages.descriptionSectionNote} />
    </Text>
  </Box>
);

ProjectDescriptionSection.craft = {
  related: {
    settings: DescriptionSectionSettings,
  },
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.descriptionSectionTitle,
    locked: true,
  },
};

export default ProjectDescriptionSection;
