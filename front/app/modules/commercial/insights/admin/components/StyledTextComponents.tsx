import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

export const SectionTitle = styled.h2`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.l}px;
  display: flex;
  align-items: baseline;
  margin: 0;
`;

export const TooltipContent = styled.p`
  font-weight: normal;
`;

export const TooltipContentList = styled.ul`
  margin: 0 0 0 15px;
  padding: 0;
`;
