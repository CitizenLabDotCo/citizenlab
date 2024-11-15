import React from 'react';

import Modal from './Modal';
import SuccessActions from './SuccessActions';

export interface Props {
  onToggleModal: (opened: boolean) => void;
}

const Authentication = ({ onToggleModal }: Props) => {
  return (
    <>
      <SuccessActions />
      <Modal onToggleModal={onToggleModal} />
    </>
  );
};

export default Authentication;
