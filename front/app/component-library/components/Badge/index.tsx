import styled from 'styled-components';

import { colors, fontSizes } from '../../utils/styleUtils';
import Box from '../Box';

export default styled(Box)`
  color: ${(props) => props.color || colors.disabled};
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: ${(props) => props.theme.borderRadius};
  padding: 4px 8px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 500;
  border: solid 1px ${(props) => props.color || colors.disabled};

  &.inverse {
    color: #fff;
    background-color: ${(props) => props.color || colors.disabled};
    border: none;
  }
`;
