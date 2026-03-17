import React, { RefObject } from 'react';

import { IUserData } from 'api/users/types';

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
}

const Modals = ({
  modalOpened,
  user,
  moreActionsButtonRef,
  closeModal,
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
      <Modal
        opened={modalOpened === 'set-moderator'}
        close={closeModal}
        // Return focus to the More Actions button on close
        returnFocusRef={moreActionsButtonRef}
        ariaLabelledBy="set-moderator-modal-title"
      >
        <SetAsModerator user={user} onClose={closeModal} />
      </Modal>
    </>
  );
};

export default Modals;
