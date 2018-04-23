
// style
import styled from 'styled-components';
import { colors, fontSize } from 'utils/styleUtils';

export default styled.h1`
  color: ${colors.title};
  font-size: ${fontSize('xxxl')};
  line-height: 40px;
  font-weight: 600;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

