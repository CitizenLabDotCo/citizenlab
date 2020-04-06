import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

export const Options = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const Option = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;

  & button {
    color: ${colors.text};
    font-size: ${fontSizes.base}px;
    font-weight: 500;
    line-height: normal;
    text-align: right;
    text-decoration: underline;
    padding: 0;
    margin: 0;
    cursor: pointer;

    &:hover {
      color: #000;
      text-decoration: underline;
    }
  }
`;
