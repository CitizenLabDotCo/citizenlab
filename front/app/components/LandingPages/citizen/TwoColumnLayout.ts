import { Box, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';

import Image from 'components/UI/Image';

export const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  background: white;

  ${media.phone`
    flex-direction: column;
    align-items: normal;
  `}
`;

export const HeaderImageWrapper = styled.div`
  width: 50%;
  overflow: hidden;

  ${media.phone`
    width: 100%;
  `}
`;

export const HeaderImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;

  ${media.phone`
    height: ${homepageBannerLayoutHeights.two_column_layout.phone}px;
  `}
`;

export const TextWrapper = styled(Box)`
  width: 50%;

  ${media.phone`
    width: 100%;
  `}
`;
