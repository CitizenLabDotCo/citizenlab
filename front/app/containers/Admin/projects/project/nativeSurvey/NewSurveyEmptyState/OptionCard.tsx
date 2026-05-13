import { colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const OptionCard = styled.button<{ highlighted?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  border-radius: ${stylingConsts.borderRadius};
  border: 1px solid
    ${({ highlighted }) => (highlighted ? colors.blue500 : colors.grey300)};
  background: ${({ highlighted }) =>
    highlighted ? colors.teal50 : colors.white};
  cursor: pointer;
  flex: 1;
  text-align: left;

  &:hover {
    border-color: ${colors.blue500};
    background: ${colors.teal50};
  }
`;

export default OptionCard;
