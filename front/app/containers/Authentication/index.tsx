import React from 'react';
import SuccessActions from './SuccessActions';
import Modal from './Modal';

interface Props {
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
