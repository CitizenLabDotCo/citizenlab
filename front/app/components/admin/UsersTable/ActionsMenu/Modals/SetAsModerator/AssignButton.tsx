import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import checkIfUserExceedsSeats from 'api/users/checkIfUserExceedsSeats';
import { IUserData } from 'api/users/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  disabled?: boolean;
  user: IUserData;
  onClose: () => void;
  onAssign: () => Promise<void>;
  onExceedsSeats: () => void;
}

const AssignButton = ({
  disabled,
  user,
  onClose,
  onAssign,
  onExceedsSeats,
}: Props) => {
  const { formatMessage } = useIntl();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const shouldOpenModal = await checkIfUserExceedsSeats({
      user_id: user.id,
      seat_type: 'moderator',
    });

    if (shouldOpenModal) {
      onExceedsSeats();
    } else {
      doAssign();
    }
  };

  const doAssign = async () => {
    setIsLoading(true);
    await onAssign();
    setIsLoading(false);
    onClose();
  };

  return (
    <>
      <Box display="flex" justifyContent="flex-end" mt="20px">
        <Button
          onClick={handleClick}
          disabled={disabled}
          processing={isLoading}
        >
          {formatMessage(messages.assign)}
        </Button>
      </Box>
    </>
  );
};

export default AssignButton;
