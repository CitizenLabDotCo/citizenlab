import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

export default styled(Box)`
  background: ${colors.grey100};
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px);
  width: 100%;
  height: 100%;
  position: relative;

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;
