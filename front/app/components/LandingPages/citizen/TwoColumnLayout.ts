import Image from 'components/UI/Image';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import styled from 'styled-components';
import { media } from '@citizenlab/cl2-component-library';

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

export const HeaderImage = styled(Image)`
  height: ${homepageBannerLayoutHeights.two_column_layout.desktop}px;
  overflow: hidden;

  ${media.phone`
    width: 100%;
    height: ${homepageBannerLayoutHeights.two_column_layout.phone}px;
  `}
`;
