import Image from 'components/UI/Image';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import styled from 'styled-components';
import { media } from '@citizenlab/cl2-component-library';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  ${media.tablet`
    padding: 0;
  `}
`;

export const HeaderImage = styled(Image)`
  width: 100%;
  height: ${homepageBannerLayoutHeights['two_row_layout'].desktop}px;
  overflow: hidden;

  ${media.tablet`
    height: ${homepageBannerLayoutHeights['two_row_layout'].tablet}px;
  `}

  ${media.phone`
    height: ${homepageBannerLayoutHeights['two_row_layout'].phone}px;
  `}
`;
