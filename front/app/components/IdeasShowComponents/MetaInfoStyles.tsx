import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

export const Item = styled.div<{ isFirstItem?: boolean; compact?: boolean }>`
  border-top: ${({ isFirstItem }) =>
    isFirstItem ? `1px solid #e0e0e0` : 'none'};
  border-bottom: 1px solid #e0e0e0;
  padding-top: 18px;
  padding-bottom: 21px;

  ${({ compact }) =>
    compact &&
    `
    padding-top: 13px;
    padding-bottom: 17px;
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
