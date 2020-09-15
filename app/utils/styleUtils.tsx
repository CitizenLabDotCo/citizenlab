import { css } from 'styled-components';
import { transparentize } from 'polished';

import {
  viewportWidths,
  media,
  colors,
  fontSizes,
  // defaultStyles,
  // defaultCardStyle,
  defaultCardHoverStyle,
  defaultOutline,
  defaultInputStyle,
  stylingConsts,
  quillEditedContent,
  getTheme,
  invisibleA11yText,
  remCalc,
  calculateContrastRatio,
  hexToRgb,
} from 'cl2-component-library';

const defaultStyles = {
  boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.06)',
  boxShadowHover: '0px 4px 12px -1px rgba(0,0,0,0.12)',
  boxShadowFocused: `0 0 0 3px ${transparentize(0.65, colors.label)}`,
  boxShadowError: `0 0 0 3px ${transparentize(0.65, colors.clRedError)}`,
  inputPadding: '12px',
};

const defaultCardStyle = css`
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: ${defaultStyles.boxShadow};
`;

export {
  viewportWidths,
  media,
  colors,
  fontSizes,
  defaultStyles,
  defaultCardStyle,
  defaultCardHoverStyle,
  defaultOutline,
  defaultInputStyle,
  stylingConsts,
  quillEditedContent,
  getTheme,
  invisibleA11yText,
  remCalc,
  calculateContrastRatio,
  hexToRgb,
};
