import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import styled from 'styled-components';
import { media, colors } from '@citizenlab/cl2-component-library';

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${colors.background};
`;

export const Header = styled.div`
  width: 100%;
  height: ${homepageBannerLayoutHeights.full_width_banner_layout.desktop}px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.tablet`
    height: ${homepageBannerLayoutHeights.full_width_banner_layout.tablet}px;
  `}

  ${media.phone`
    height: ${homepageBannerLayoutHeights.full_width_banner_layout.phone}px;
  `}
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
  ${({ src }) => src && `background-image: url(${src});`}
`;

export const HeaderImageOverlay = styled.div<{
  overlayColor: string;
  overlayOpacity: number;
}>`
  background: ${({ overlayColor }) => overlayColor};
  opacity: ${({ overlayOpacity }) => overlayOpacity / 100};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;
