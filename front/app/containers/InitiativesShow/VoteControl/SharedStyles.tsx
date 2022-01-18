import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';

export const StatusWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
  font-size: ${fontSizes.small};
  text-transform: uppercase;
  color: ${colors.clGreyOnGreyBackground};

  &.answered {
    color: ${colors.clGreen};
  }

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

export const StatusExplanation = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colorText};
  line-height: 23px;

  .tooltip-icon {
    margin-left: 3px;
    display: inline-block;
  }

  b {
    font-weight: 600;
    background-color: rgba(255, 197, 47, 0.16);
  }
`;
