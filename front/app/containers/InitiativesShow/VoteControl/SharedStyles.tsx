import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';

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

export const TooltipWrapper = styled.div`
  padding: 15px;
  min-width: 150px;
  max-width: 300px;
  font-size: ${fontSizes.small}px;
  color: ${({ theme }) => theme.colorText};
  font-weight: 400;
  line-height: 16px;
  text-align: left;
`;

export const HelpIcon = styled(Icon)`
  width: 12px;
  height: 12px;
`;
