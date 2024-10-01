import { colors, fontSizes, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

export const ListItemText = styled.span`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  ${isRtl`
    text-align: right;
  `}
`;

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;
