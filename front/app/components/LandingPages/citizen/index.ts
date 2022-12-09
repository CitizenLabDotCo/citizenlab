import styled from 'styled-components';
import { media } from 'utils/styleUtils';

export const Container = styled.main`
  height: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: #fff;

  ${media.tablet`
    min-height: auto;
  `}
`;

export const Content = styled.div`
  width: 100%;
  z-index: 3;
`;
