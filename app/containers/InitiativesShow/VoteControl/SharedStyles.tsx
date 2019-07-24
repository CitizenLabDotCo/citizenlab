import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';

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

export const StatusExplanation = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${props => props.theme.colorText};
  line-height: 20px;

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
  font-weight: 400;
  line-height: 16px;
  text-align: left;
`;

export const HelpIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  margin-left: 4px;
`;

