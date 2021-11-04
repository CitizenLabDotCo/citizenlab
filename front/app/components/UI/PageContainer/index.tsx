import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

export default styled.div`
  background: ${colors.background};
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  width: 100%;
  position: relative;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;
