import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';

// components
import { Icon, colors } from 'cl2-component-library';
import ModalWithMap from './ModalWithMap';

import { isRtl } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledIcon = styled(Icon)`
  width: 15px;
  height: 21px;
  fill: ${colors.label};
  margin-right: 8px;
  ${isRtl`
    margin-right: 0;
    margin-left: 8px;
  `}
`;

const OpenMapModalButton = styled.button`
  color: ${colors.label};
  text-decoration: underline;
  text-align: left;
  margin: 0;
  padding: 0;
  border: none;
  appearance: none;
  cursor: pointer;

  &:hover {
    color: ${darken(0.2, colors.label)};
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
        <OpenMapModalButton id="e2e-map-popup" onClick={openModal}>
          {address}
        </OpenMapModalButton>
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
