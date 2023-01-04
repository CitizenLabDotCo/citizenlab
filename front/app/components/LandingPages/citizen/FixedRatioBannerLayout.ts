import styled from 'styled-components';

import { media, colors, stylingConsts } from 'utils/styleUtils';

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
  max-width: ${stylingConsts.pageWidth}px;
  min-height: 225px;
  margin: 0 auto;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.borderRadius};
`;
