// component
import { RightColumn } from 'containers/Admin';

// styling
import styled from 'styled-components';
import { stylingConsts } from 'utils/styleUtils';

export const StyledRightColumn = styled(RightColumn)`
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
  overflow-y: auto;
`;
