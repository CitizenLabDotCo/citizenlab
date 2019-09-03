import { fontSizes, colors, media } from 'utils/styleUtils';
import styled from 'styled-components';

export const HeaderTitle = styled.h3`
  display: flex;
  align-items: center;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.xl}px;
  font-weight: 400;
  padding: 0;
  margin: 0;
  margin-right: 7px;
`;
