import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

export const StatusWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
  font-size: ${fontSizes.small};
  text-transform: uppercase;
  color: ${colors.mediumGrey};

  &.answered {
    color: ${colors.clGreen};
  }
`;

