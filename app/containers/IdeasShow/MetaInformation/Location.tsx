import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';

// components
import { Icon, colors } from 'cl2-component-library';
import ModalWithMap from './ModalWithMap';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  width: 15px;
  height: 21px;
  fill: ${colors.label};
  margin-right: 8px;
`;

const OpenMapModalButton = styled.button`
  color: ${colors.label};
  text-decoration: underline;

  &:hover {
    color: ${darken(0.2, colors.label)};
    cursor: pointer;
  }
`;

export interface Props {
  className?: string;
  address: string;
  position: GeoJSON.Point;
  projectId: string;
}

const Location = memo<Props>(({ address, position, projectId }) => {
  const [isOpened, setIsOpened] = useState(false);

  const closeModal = () => {
    setIsOpened(false);
  };

  const openModal = () => {
    setIsOpened(true);
  };

  return (
    <>
      <Container>
        <StyledIcon name="position" ariaHidden />
        <OpenMapModalButton onClick={openModal}>{address}</OpenMapModalButton>
      </Container>
      <ModalWithMap
        position={position}
        projectId={projectId}
        isOpened={isOpened}
        onCloseModal={closeModal}
      />
    </>
  );
});

export default Location;
