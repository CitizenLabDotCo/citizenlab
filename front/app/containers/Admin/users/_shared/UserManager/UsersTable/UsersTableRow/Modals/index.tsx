import React, { RefObject } from 'react';

import { IUserData } from 'api/users/types';

import SeatLimitReachedModal from 'components/admin/SeatBasedBilling/SeatLimitReachedModal';
import BlockUser from 'components/admin/UserBlockModals/BlockUser';
import UnblockUser from 'components/admin/UserBlockModals/UnblockUser';
import DeleteUser from 'components/admin/UserDeleteModal';
import Modal from 'components/UI/Modal';

import { ModalName } from '../types';

import SetAsModerator from './SetAsModerator';
import UserAssignedItems from './UserAssignedItems';

interface Props {
  modalOpened: ModalName | null;
  user: IUserData;
  moreActionsButtonRef: RefObject<HTMLButtonElement>;
  closeModal: () => void;
  onAcceptIncreasedSeatLimitForAdmin: () => void;
}

const Modals = ({
  modalOpened,
  user,
  moreActionsButtonRef,
  closeModal,
  onAcceptIncreasedSeatLimitForAdmin,
}: Props) => {
  return (
    <>
      {modalOpened === 'block-user' && (
        <BlockUser
          user={user}
          setClose={closeModal}
          returnFocusRef={moreActionsButtonRef}
        />
      )}
      {modalOpened === 'unblock-user' && (
        <UnblockUser
          user={user}
          setClose={closeModal}
          returnFocusRef={moreActionsButtonRef}
        />
      )}
      {modalOpened === 'delete-user' && (
        <DeleteUser
          user={user}
          setClose={closeModal}
          returnFocusRef={moreActionsButtonRef}
        />
      )}
      <Modal
        opened={modalOpened === 'user-assigned-items'}
        close={closeModal}
        // Return focus to the More Actions button on close
        returnFocusRef={moreActionsButtonRef}
        ariaLabelledBy="assigned-items-modal-title"
      >
        <UserAssignedItems user={user} />
      </Modal>
      <SetAsModerator
        opened={modalOpened === 'set-moderator'}
        user={user}
        moreActionsButtonRef={moreActionsButtonRef}
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
