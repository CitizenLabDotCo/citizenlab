import { fontSizes, colors } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';
import styled from 'styled-components';

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-left: 18px;
  margin-right: 22px;
`;

export const Title = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 600;
  text-transform: uppercase;
  margin-right: 20px;
`;

export const ClearButtonIcon = styled(Icon)`
  width: 10px;
  height: 10px;
  fill: ${colors.label};
  margin-right: 3px;
  margin-top: 1px;
`;

export const ClearButtonText = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: 14px;
`;

export const ClearButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  &.hidden {
    opacity: 0;
  }

  &:hover {
    ${ClearButtonIcon} {
      fill: #000;
    }

    ${ClearButtonText} {
      color: #000;
    }
  }
`;