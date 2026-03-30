import React from 'react';

import { IUserData } from 'api/users/types';

import SeatLimitReachedModal from 'components/admin/SeatBasedBilling/SeatLimitReachedModal';
import BlockUser from 'components/admin/UserBlockModals/BlockUser';
import UnblockUser from 'components/admin/UserBlockModals/UnblockUser';
import DeleteUser from 'components/admin/UserDeleteModal';

import { ModalName } from '../types';

import SetAsModerator from './SetAsModerator';

interface Props {
  modalOpened: ModalName | null;
  user: IUserData;
  closeModal: () => void;
  onAcceptIncreasedSeatLimitForAdmin: () => void;
}

const Modals = ({
  modalOpened,
  user,
  closeModal,
  onAcceptIncreasedSeatLimitForAdmin,
}: Props) => {
  return (
    <>
      {modalOpened === 'block-user' && (
        <BlockUser user={user} setClose={closeModal} />
      )}
      {modalOpened === 'unblock-user' && (
        <UnblockUser user={user} setClose={closeModal} />
      )}
      {modalOpened === 'delete-user' && (
        <DeleteUser user={user} setClose={closeModal} />
      )}
      <SetAsModerator
        opened={modalOpened === 'set-moderator'}
        user={user}
        onClose={closeModal}
      />
      <SeatLimitReachedModal
        seatType="admin"
        showModal={modalOpened === 'seat-limit-reached'}
        closeModal={closeModal}
        addModerators={onAcceptIncreasedSeatLimitForAdmin}
      />
    </>
  );
};

export default Modals;
