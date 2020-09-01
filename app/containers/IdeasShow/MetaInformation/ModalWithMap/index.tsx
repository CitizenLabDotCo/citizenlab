import React, { lazy, Suspense } from 'react';
import Modal from 'components/UI/Modal';
const Map = lazy(() => import('./Map'));
import { Spinner } from 'cl2-component-library';

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
    <Modal padding={'70px 30px 30px'} opened={isOpened} close={onCloseModal}>
      <Suspense fallback={<Spinner />}>
        <Map position={position} projectId={projectId} />
      </Suspense>
    </Modal>
  );
};

export default ModalWithMap;
