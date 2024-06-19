import { colors, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.tablet`
    min-height: auto;
  `}
`;

export const Content = styled.div`
  width: 100%;
  z-index: 3;
`;
