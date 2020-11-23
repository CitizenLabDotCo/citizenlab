import React, { lazy, Suspense } from 'react';
import Modal from 'components/UI/Modal';
import { Spinner } from 'cl2-component-library';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Map = lazy(() => import('./Map'));

const Container = styled.div`
  padding: 30px;

  ${media.smallerThanMinTablet`
    padding: 20px;
  `}
`;

const Location = styled.div`
  width: calc(100% - 35px);
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

interface Props {
  address: string;
  position: GeoJSON.Point;
  onCloseModal: () => void;
  projectId: string;
  isOpened: boolean;
}

const ModalWithMap = ({
  address,
  position,
  projectId,
  isOpened,
  onCloseModal,
}: Props) => {
  return (
    <Modal
      opened={isOpened}
      close={onCloseModal}
      header={<Location>{address}</Location>}
    >
      <Suspense fallback={<Spinner />}>
        <Container>
          <Map position={position} projectId={projectId} />
        </Container>
      </Suspense>
    </Modal>
  );
};

export default ModalWithMap;
