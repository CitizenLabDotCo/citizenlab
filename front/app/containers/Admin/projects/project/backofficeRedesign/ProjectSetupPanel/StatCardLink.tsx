import { colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';

import Link, { typedStyled } from 'utils/cl-router/Link';

export const STAT_CARD_PADDING = 12;

const statCardStyle = css`
  display: block;
  margin: 10px 0 12px;
  padding: ${STAT_CARD_PADDING}px;
  border: 1px solid ${colors.grey200};
  border-radius: ${stylingConsts.borderRadius};
  background: ${colors.grey50};
`;

export const StatCard = styled.div`
  ${statCardStyle}
`;

const StatCardLink = typedStyled(Link)`
  ${statCardStyle}
  text-decoration: none;
  transition: background 80ms ease-out;

  &:hover {
    background: ${colors.grey100};
  }
`;

export default StatCardLink;
