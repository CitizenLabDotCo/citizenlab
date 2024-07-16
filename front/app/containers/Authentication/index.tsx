import React from 'react';

import Modal from './Modal';
import SuccessActions from './SuccessActions';

export interface Props {
  setModalOpen: (bool: boolean) => void;
}

const Authentication = ({ setModalOpen }: Props) => {
  return (
    <>
      <SuccessActions />
      <Modal setModalOpen={setModalOpen} />
    </>
  );
};

export default Authentication;
