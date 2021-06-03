import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

export const Item = styled.div<{ compact?: boolean }>`
  padding-top: 18px;
  padding-bottom: 21px;
  border-bottom: 1px solid #e0e0e0;

  ${({ compact }) =>
    compact &&
    `
    padding-top: 11px;
    padding-bottom: 15px;
    border-bottom: none;
  `};
`;

export const Header = styled.h3`
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  color: ${(props) => props.theme.colorText};
  padding: 0;
  margin: 0;
  margin-bottom: 12px;
`;
