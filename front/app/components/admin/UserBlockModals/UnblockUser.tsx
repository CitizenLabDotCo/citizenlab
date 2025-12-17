import React from 'react';

import { Title, Button } from '@citizenlab/cl2-component-library';

import useUnblockUser from 'api/blocked_users/useUnblockUser';
import { IUserData } from 'api/users/types';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

type Props = {
  setClose: () => void;
  user: IUserData;
  /**
   * Optional ref to return focus on close.
   * By default, focus returns to the control that opened the modal.
   * Use this ref if you want to return focus to another ref.
   */
  returnFocusRef?: React.RefObject<HTMLElement>;
};

const UnblockUserModal = ({ setClose, user, returnFocusRef }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: unBlockUser } = useUnblockUser();

  const handleOnClick = () => {
    unBlockUser(user.id, {
      onSuccess: () => {
        setClose();
      },
    });
  };
  return (
    <Modal
      width={400}
      close={setClose}
      opened={true}
      returnFocusRef={returnFocusRef}
    >
      <Title variant="h3" m="35px 0 30px">
        {formatMessage(messages.confirmUnblock, {
          name: getFullName(user),
        })}
      </Title>
      <Button mb="20px" data-testid="unblockBtn" onClick={handleOnClick}>
        {formatMessage(messages.unblockActionConfirmation)}
      </Button>
      <Button buttonStyle="secondary-outlined" onClick={setClose}>
        {formatMessage(messages.cancel)}
      </Button>
    </Modal>
  );
};

export default UnblockUserModal;
