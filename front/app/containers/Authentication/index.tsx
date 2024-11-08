import React from 'react';

import Modal from './Modal';
import SuccessActions from './SuccessActions';

export interface Props {
  onToggleModal: (opened: boolean) => void;
}

const Authentication = ({ onToggleModal: setModalOpen }: Props) => {
  return (
    <>
      <SuccessActions />
      <Modal onToggleModal={setModalOpen} />
    </>
  );
};

export default Authentication;
