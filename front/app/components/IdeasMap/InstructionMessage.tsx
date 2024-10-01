import React from 'react';

import { Box, useBreakpoint, Text } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import messages from './messages';

type Props = {
  projectId: string;
};

const InstructionMessage = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const isTabletOrSmaller = useBreakpoint('tablet');
  const { data: project } = useProjectById(projectId);

  if (!project) return null;

  const getInstructionMessage = () => {
    if (canModerateProject(project.data, authUser)) {
      return isTabletOrSmaller
        ? formatMessage(messages.tapOnMapToAddAdmin)
        : formatMessage(messages.clickOnMapToAddAdmin);
    }

    return isTabletOrSmaller
      ? formatMessage(messages.tapOnMapToAdd)
      : formatMessage(messages.clickOnMapToAdd);
  };

  if (authUser) {
    return (
      <Box
        position="absolute"
        top="0"
        right="0"
        mr="60px"
        mt="16px"
        display="flex"
        justifyContent="flex-end"
        maxWidth={isTabletOrSmaller ? '260px' : '340px'}
      >
        <Warning>
          <Text m="0px" fontSize="xs" color={'teal700'}>
            {getInstructionMessage()}
          </Text>
        </Warning>
      </Box>
    );
  }

  return null;
};

export default InstructionMessage;
