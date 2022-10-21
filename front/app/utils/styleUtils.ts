import {
  calculateContrastRatio,
  colors,
  defaultCardHoverStyle,
  defaultCardStyle,
  defaultInputStyle,
  defaultOutline,
  defaultStyles,
  fontSizes,
  getTheme,
  hexToRgb,
  invisibleA11yText,
  media,
  quillEditedContent,
  remCalc,
  stylingConsts,
  viewportWidths,
} from '@citizenlab/cl2-component-library';

import { css } from 'styled-components';

const isRtl = (style, ...args) => css`
  ${(props) => (props.theme.isRtl ? css(style, ...args) : '')}
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
  isRtl,
};
