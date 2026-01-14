import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';

import Image from 'components/UI/Image';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  ${media.tablet`
    padding: 0;
  `}
`;

export const defaultHeights = {
  desktop: homepageBannerLayoutHeights['two_row_layout'].desktop,
  tablet: homepageBannerLayoutHeights['two_row_layout'].tablet,
  phone: homepageBannerLayoutHeights['two_row_layout'].phone,
};

export const HeaderImage = styled(Image)<{
  desktopHeight?: number;
  tabletHeight?: number;
  phoneHeight?: number;
}>`
  width: 100%;
  height: ${(props) => props.desktopHeight ?? defaultHeights.desktop}px;
  overflow: hidden;

  ${media.tablet`
    height: ${(props) => props.tabletHeight ?? defaultHeights.tablet}px;
  `}

  ${media.phone`
    height: ${(props) => props.phoneHeight ?? defaultHeights.phone}px;
  `}
`;
