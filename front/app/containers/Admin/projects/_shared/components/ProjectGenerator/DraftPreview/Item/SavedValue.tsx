import { colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// What a proposed change removes or replaces.
const SavedValue = styled.del`
  color: ${colors.textSecondary};
  background-color: ${colors.red100};
  border-radius: ${stylingConsts.borderRadius};
  box-decoration-break: clone;
  padding: 0 4px;
  margin: 0 -4px;
`;

export default SavedValue;
