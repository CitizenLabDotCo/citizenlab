import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

export const ItemMenu = styled(ButtonWithLink)`
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

export const StyledText = styled(Text)`
  font-size: 15px;
`;
