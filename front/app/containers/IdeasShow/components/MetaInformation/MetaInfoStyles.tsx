import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

export const Item = styled.div<{ compact?: boolean }>`
  padding-top: 18px;
  padding-bottom: 20px;
  border-top: solid 1px #ccc;

  &:first-of-type {
    border-top: none;
  }

  ${({ compact }) =>
    compact &&
    `
      padding-top: 12px;
      padding-bottom: 17px;
  `};
`;

export const Header = styled.h3`
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.tenantText};
  padding: 0;
  margin: 0;
  margin-bottom: 12px;
`;
