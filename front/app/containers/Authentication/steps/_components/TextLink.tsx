import { fontSizes, colors } from '@citizenlab/cl2-component-library';

import Link, { typedStyled } from 'utils/cl-router/Link';

export const ClickableTextStyles = `
  font-size: ${fontSizes.base}px;
  color: ${colors.textSecondary};
  text-decoration: underline;

  &:hover {
    color: ${colors.textPrimary};
    text-decoration: underline;
  }
`;
export const StyledLink = typedStyled(Link)`${ClickableTextStyles}`;

export default StyledLink;
