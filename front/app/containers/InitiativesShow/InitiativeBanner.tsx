import React, { ReactNode } from 'react';
import styled from 'styled-components';
import InitiativeBannerImage from './InitiativeBannerImage';

const InitiativeBannerContainer = styled.div`
  width: 100%;
  height: 163px;
  display: flex;
  align-items: stretch;
  position: relative;
  background: ${({ theme }) => theme.colors.tenantPrimary};
  min-height: 200px;
`;

const InitiativeHeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0) 100%
    ),
    linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
`;

interface Props {
  initiativeHeaderImageLarge: string | null;
  children?: ReactNode;
}

const InitiativeBanner = ({ initiativeHeaderImageLarge, children }: Props) => {
  return (
    <InitiativeBannerContainer>
      {typeof initiativeHeaderImageLarge === 'string' && (
        <>
          <InitiativeBannerImage src={initiativeHeaderImageLarge} />
          <InitiativeHeaderOverlay />
        </>
      )}
      {children}
    </InitiativeBannerContainer>
  );
};

export default InitiativeBanner;
