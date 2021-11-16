import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import HeaderContent from './HeaderContent';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  min-height: 450px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.desktop`
    min-height: 450px;
  `}

  ${media.smallerThanMaxTablet`
    min-height: 350px;
  `}

  ${media.smallerThanMinTablet`
    min-height: 300px;
  `}
`;

const HeaderImage = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImageBackground = styled.div<{ src: string | null }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${({ src }) => src});
`;

const HeaderImageOverlay = styled.div`
  background: ${({ theme }) =>
    theme.signedOutHeaderOverlayColor || theme.colorMain};
  opacity: ${({ theme }) => theme.signedOutHeaderOverlayOpacity};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

export interface Props {
  className?: string;
}

const SignedOutHeader = ({ className }: Props) => {
  const appConfiguration = useAppConfiguration();

  if (!isNilOrError(appConfiguration)) {
    const headerImage = appConfiguration.data.attributes.header_bg?.large;

    return (
      <Container className={`e2e-signed-out-header ${className}`}>
        <Header id="hook-header">
          <HeaderImage id="hook-header-image">
            <HeaderImageBackground src={headerImage || null} />
            <HeaderImageOverlay />
          </HeaderImage>

          <HeaderContent />
        </Header>
      </Container>
    );
  }

  return null;
};

export default SignedOutHeader;
