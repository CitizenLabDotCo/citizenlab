import React from 'react';

// components
import { Box, useBreakpoint, Text } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import useAuthUser from 'api/me/useAuthUser';

// utils
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';
import useProjectById from 'api/projects/useProjectById';

type Props = {
  projectId: string;
};

const InstructionMessage = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const isTabletOrSmaller = useBreakpoint('tablet');
  const { data: project } = useProjectById(projectId);

  const getInstructionMessage = () => {
    if (project && authUser && canModerateProject(project.data, authUser)) {
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
