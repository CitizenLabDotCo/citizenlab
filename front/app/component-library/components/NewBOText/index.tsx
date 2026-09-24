import React from 'react';

import styled, { css } from 'styled-components';

import {
  Color,
  colors,
  fontSizes,
  isRtl,
  MainThemeProps,
  newBO,
} from '../../utils/styleUtils';
import Box, {
  BoxMarginProps,
  BoxPaddingProps,
  BoxDisplayProps,
  BoxWidthProps,
  BoxOverflowProps,
} from '../Box';

/**
 * The back office's four type styles, from the design system's admin
 * hierarchy: https://govocal.augur.page/ux-ui-audit/design-system/#type
 *
 */
export type NewBOTextVariant = 'section' | 'label' | 'helper' | 'micro';

const ROLES: Record<
  NewBOTextVariant,
  { fontSize: number; fontWeight: number; lineHeight: number; color: string }
> = {
  section: {
    fontSize: fontSizes.s,
    fontWeight: 500,
    lineHeight: 1.4,
    color: newBO.colors.textHeadingStrong,
  },
  label: {
    fontSize: fontSizes.s,
    fontWeight: 400,
    lineHeight: 1.4,
    color: newBO.colors.textHeading,
  },
  helper: {
    fontSize: fontSizes.s,
    fontWeight: 400,
    lineHeight: 1.4,
    color: colors.coolGrey600,
  },
  micro: {
    fontSize: fontSizes.xs,
    fontWeight: 400,
    lineHeight: 1.4,
    color: colors.coolGrey600,
  },
};

type TextAlign = 'left' | 'right' | 'center';

export type NewBOTextProps = {
  variant: NewBOTextVariant;
  /** Only where the role's colour is wrong: an error, a done row, a muted heading. */
  color?: Color;
  as?: 'p' | 'span' | 'div' | 'li' | 'label';
  textAlign?: TextAlign;
} & BoxMarginProps &
  BoxPaddingProps &
  BoxDisplayProps &
  BoxWidthProps &
  BoxOverflowProps &
  React.HTMLAttributes<HTMLElement>;

const StyledText = styled(Box)<NewBOTextProps>`
  ${isRtl`direction: rtl;`}
  ${({
    variant,
    color,
    textAlign,
    theme,
  }: NewBOTextProps & { theme: MainThemeProps }) => {
    const role = ROLES[variant];

    return css`
      font-size: ${role.fontSize}px;
      font-weight: ${role.fontWeight};
      line-height: ${role.lineHeight};
      color: ${color ? theme.colors[color] : role.color};
      ${textAlign ? `text-align: ${textAlign};` : ''}
    `;
  }}
`;

const NewBOText = ({ children, as, ...props }: NewBOTextProps) => (
  <StyledText as={as || 'p'} m="0" {...props}>
    {children}
  </StyledText>
);

export default NewBOText;
