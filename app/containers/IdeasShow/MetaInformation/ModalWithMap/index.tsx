import React from 'react';
import Modal from 'components/UI/Modal';
import Map from './Map';

interface Props {
  position: GeoJSON.Point;
  onCloseModal: () => void;
  projectId: string;
  isOpened: boolean;
}

const ModalWithMap = ({
  position,
  projectId,
  isOpened,
  onCloseModal,
}: Props) => {
  return (
    <Modal opened={isOpened} close={onCloseModal}>
      <Map position={position} projectId={projectId} />
    </Modal>
  );
};

export default ModalWithMap;
