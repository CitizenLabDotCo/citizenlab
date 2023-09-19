import { rgba } from 'polished';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

export const ItemMenu = styled(Button)`
  color: ${colors.coolGrey600};
  display: flex;
  align-items: center;
  width: 100%;
  &:hover {
    background: ${rgba(colors.teal400, 0.07)};
  }
  span {
    width: 100%;
  }
`;

export const StyledBox = styled(Box)`
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;
