import { css } from 'styled-components';
import {
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
} from '@citizenlab/cl2-component-library';

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
