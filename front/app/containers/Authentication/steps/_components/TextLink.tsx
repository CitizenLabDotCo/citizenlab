import { fontSizes, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Link from 'utils/cl-router/Link';

export const ClickableTextStyles = `
  font-size: ${fontSizes.base}px;
  color: ${colors.textSecondary};
  text-decoration: underline;

  &:hover {
    color: ${colors.textPrimary};
    text-decoration: underline;
  }
`;
export const StyledLink = styled(Link)`${ClickableTextStyles}}` as typeof Link;

export default StyledLink;
