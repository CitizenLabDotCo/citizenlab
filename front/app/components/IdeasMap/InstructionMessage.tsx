import React from 'react';

// components
import { Box, useBreakpoint, Text } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import useAuthUser from 'api/me/useAuthUser';

// utils
import { isAdmin, isProjectModerator } from 'utils/permissions/roles';

type Props = {
  projectId: string;
};

const InstructionMessage = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const isTabletOrSmaller = useBreakpoint('tablet');

  const isAdminOrModerator = authUser
    ? isAdmin(authUser) || isProjectModerator(authUser, projectId)
    : false;

  const getInstructionMessage = () => {
    if (isAdminOrModerator) {
      return isTabletOrSmaller
        ? formatMessage(messages.tapOnMapToAddAdmin)
        : formatMessage(messages.clickOnMapToAddAdmin);
    }
    return isTabletOrSmaller
      ? formatMessage(messages.tapOnMapToAdd)
      : formatMessage(messages.clickOnMapToAdd);
  };

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
};

export default InstructionMessage;
