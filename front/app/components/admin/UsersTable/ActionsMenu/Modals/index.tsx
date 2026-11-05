import React from 'react';

import { IUserData } from 'api/users/types';

import SeatLimitReachedModal from 'components/admin/SeatBasedBilling/SeatLimitReachedModal';
import BlockUser from 'components/admin/UserBlockModals/BlockUser';
import UnblockUser from 'components/admin/UserBlockModals/UnblockUser';
import DeleteUser from 'components/admin/UserDeleteModal';

import { ModalName } from '../types';
import { Resources } from '../useAssignModerator';

import SetAsModerator from './SetAsModerator';

interface Props {
  modalOpened: ModalName | null;
  user: IUserData;
  closeModal: () => void;
  onAcceptIncreasedSeatLimitForAdmin: () => void;
  onAssignModerator: (resources: Resources) => Promise<void>;
  onAcceptIncreasedSeatLimitForModerator: () => void;
}

const Modals = ({
  modalOpened,
  user,
  closeModal,
  onAcceptIncreasedSeatLimitForAdmin,
  onAssignModerator,
  onAcceptIncreasedSeatLimitForModerator,
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
        onAssign={onAssignModerator}
      />
      <SeatLimitReachedModal
        seatType="admin"
        showModal={modalOpened === 'seat-limit-reached-admin'}
        closeModal={closeModal}
        addModerators={onAcceptIncreasedSeatLimitForAdmin}
      />
      <SeatLimitReachedModal
        seatType="moderator"
        showModal={modalOpened === 'seat-limit-reached-moderator'}
        closeModal={closeModal}
        addModerators={onAcceptIncreasedSeatLimitForModerator}
      />
    </>
  );
};

export default Modals;
