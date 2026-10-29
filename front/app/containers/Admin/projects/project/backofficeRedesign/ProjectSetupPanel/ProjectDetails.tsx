import React, { useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import SetupCards from './SetupCards';

interface Props {
  project: IProjectData;
  onOpenSettings: () => void;
}

const ProjectDetails = ({ project, onOpenSettings }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);

  return (
    <Box>
      <Box
        as="button"
        type="button"
        id="e2e-project-details-toggle"
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="8px"
        p="0"
        background="transparent"
        border="none"
        cursor="pointer"
        aria-expanded={opened}
        aria-controls="project-details-cards"
        onClick={() => setOpened((opened) => !opened)}
      >
        <Text variant="boSection" fontSize="xs" m="0">
          {formatMessage(messages.projectDetails)}
        </Text>
        <Icon
          name={opened ? 'chevron-up' : 'chevron-down'}
          width="16px"
          height="16px"
          fill={colors.coolGrey600}
          my="0px"
        />
      </Box>

      {opened && (
        <Box
          id="project-details-cards"
          mt="16px"
          display="flex"
          flexDirection="column"
          gap="8px"
        >
          <SetupCards project={project} onOpenSettings={onOpenSettings} />
        </Box>
      )}
    </Box>
  );
};

export default ProjectDetails;
