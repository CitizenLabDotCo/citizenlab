import styled from 'styled-components';

import { gvTag } from '../../utils/gvTag';
import { colors, fontSizes } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';

// Box's own attrs run first and may have set "Box"; Badge replaces that.
export default styled(Box).attrs<BoxProps>(
  process.env.VITE_GV_DESIGN_TAGS === '1'
    ? (props) => {
        const tag = (props as unknown as Record<string, unknown>)[
          'data-gv-component'
        ];
        return tag && tag !== 'Box' ? {} : gvTag('Badge');
      }
    : {}
)`
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
