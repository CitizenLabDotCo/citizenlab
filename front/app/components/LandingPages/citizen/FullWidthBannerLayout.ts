// import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { colors } from 'utils/styleUtils';

export const Container = styled.div`
  width: 100%;
  background: ${colors.background};
  padding-top: 24px;

  ${media.tablet`
  padding-top: 0;
  `}
`;

export const Header = styled.div`
  width: 100%;
  max-width: 1150px;
  min-height: 225px;
  margin: 0 auto;
  padding: 0;
  position: relative;
  aspect-ratio: 3 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

export const HeaderImage = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const HeaderImageBackground = styled.div<{ src: string | null }>`
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

export const HeaderImageOverlay = styled.div<{
  overlayColor: string | null | undefined;
  overlayOpacity: number | null | undefined;
}>`
  background: ${({ overlayColor, theme }) =>
    overlayColor ?? theme.colors.tenantPrimary};
  opacity: ${({ overlayOpacity, theme }) =>
    (overlayOpacity ?? theme.signedOutHeaderOverlayOpacity) / 100};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;
