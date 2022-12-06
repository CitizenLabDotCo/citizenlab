import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

export const SectionTitle = styled.h2`
  color: ${colors.primary};
  font-size: ${fontSizes.l}px;
  display: flex;
  align-items: center;
  margin: 0;
`;

export const TooltipContent = styled.p`
  font-weight: normal;
`;
