import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';
import styled from 'styled-components';

import { media, colors, stylingConsts } from 'utils/styleUtils';

export const Container = styled.div`
  width: 100%;
  background: ${colors.background};
  padding-top: 24px;
  padding-bottom: 24px;

  ${media.tablet`
    padding-top: 0;
  `}
`;

export const Header = styled.div`
  width: 100%;
  max-width: ${stylingConsts.pageWidth}px;
  min-height: ${homepageBannerLayoutHeights.fixed_ratio_layout.phone}px;
  margin: 0 auto;
  padding: 0;
  position: relative;
  aspect-ratio: 3 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.borderRadius};
`;
