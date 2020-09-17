import React, { lazy, Suspense } from 'react';
import Modal from 'components/UI/Modal';
const Map = lazy(() => import('./Map'));
import useWindowSize from 'hooks/useWindowSize';
import { Spinner } from 'cl2-component-library';
import { viewportWidths } from 'utils/styleUtils';

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
  const { windowWidth } = useWindowSize();
  const smallerThanSmallTablet = windowWidth <= viewportWidths.smallTablet;

  return (
    <Modal
      padding={smallerThanSmallTablet ? '70px 0 30px' : '70px 30px 30px'}
      opened={isOpened}
      close={onCloseModal}
    >
      <Suspense fallback={<Spinner />}>
        <Map position={position} projectId={projectId} />
      </Suspense>
    </Modal>
  );
};

export default ModalWithMap;
