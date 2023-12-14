import React from 'react';

// components
import { Spinner, media } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';

export interface Props {
  admin?: boolean;
  zIndex?: number;
  background?: boolean;
}

// Centered spinner taking the navbar height (and admin sidebar) into account
const FullPageContainer = styled.div<{
  admin: boolean;
  zIndex?: number;
  background: boolean;
}>`
  position: fixed;
  top: ${(props) => props.theme.menuHeight}px;
  // 260px is the width of the admin sidebar
  left: ${(props: Props) => (props.admin ? '260px' : '0')};
  width: ${(props: Props) => (props.admin ? 'calc(100% - 260px)' : '100%')};
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  justify-content: center;
  align-items: center;

  ${(props) =>
    media.tablet`
    min-height: calc(100vh - ${props.theme.mobileMenuHeight}px - ${props.theme.mobileTopBarHeight}px);
  `}

  ${({ zIndex }) => (typeof zIndex === 'number' ? `z-index: ${zIndex};` : '')}
  ${({ background }) =>
    background ? `background: rgba(255,255,255,0.5);` : ''}
`;

const FullPageSpinner = ({
  admin = false,
  zIndex,
  background = false,
}: Props) => {
  return (
    <FullPageContainer admin={admin} zIndex={zIndex} background={background}>
      <Spinner />
    </FullPageContainer>
  );
};

export default FullPageSpinner;
