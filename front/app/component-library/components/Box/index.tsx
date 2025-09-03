import styled, { css } from 'styled-components';

type Overflow =
  | 'visible'
  | 'hidden'
  | 'scroll'
  | 'auto'
  | 'initial'
  | 'inherit';

type FlexContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'initial'
  | 'inherit';

type FlexAlign =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'baseline'
  | 'stretch'
  | 'initial'
  | 'inherit';

export type BoxColorProps = {
  color?: string;
  bgColor?: string;
  opacity?: number;
};

export type BoxBackgroundProps = {
  bg?: string;
  background?: string;
};

export type BoxPaddingProps = {
  padding?: string;
  p?: string;
  paddingLeft?: string;
  pl?: string;
  paddingRight?: string;
  pr?: string;
  paddingTop?: string;
  pt?: string;
  paddingBottom?: string;
  pb?: string;
  paddingX?: string;
  px?: string;
  paddingY?: string;
  py?: string;
};

export type BoxMarginProps = {
  margin?: string;
  m?: string;
  marginLeft?: string;
  ml?: string;
  marginRight?: string;
  mr?: string;
  marginTop?: string;
  mt?: string;
  marginBottom?: string;
  mb?: string;
  marginX?: string;
  mx?: string;
  marginY?: string;
  my?: string;
};

export type BoxHeightProps = {
  height?: string;
  h?: string;
  maxHeight?: string;
  minHeight?: string;
};

export type BoxWidthProps = {
  width?: string;
  w?: string;
  maxWidth?: string;
  minWidth?: string;
};

export type BoxShadowProps = {
  boxShadow?: string;
};

export type BoxDisplayProps = {
  display?:
    | 'block'
    | 'inline-block'
    | 'inline'
    | 'flex'
    | 'inline-flex'
    | 'none'
    | 'inherit';
};

export type BoxOverflowProps = {
  overflow?: Overflow;
  overflowX?: Overflow;
  overflowY?: Overflow;
};

export type BoxPositionProps = {
  position?: 'static' | 'relative' | 'fixed' | 'absolute' | 'sticky';
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

export type BoxFlexProps = {
  flexDirection?:
    | 'row'
    | 'row-reverse'
    | 'column'
    | 'column-reverse'
    | 'initial'
    | 'inherit';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | 'initial' | 'inherit';
  alignItems?: FlexAlign;
  justifyContent?: FlexContent;
  alignContent?: FlexContent;
  order?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number;
  flex?: string;
  alignSelf?: 'auto' | FlexAlign;
  gap?: string;
};

export type BoxBorderProps = {
  border?: string;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?:
    | 'dotted'
    | 'dashed'
    | 'solid'
    | 'double'
    | 'groove'
    | 'ridge'
    | 'inset'
    | 'outset'
    | 'none'
    | 'hidden'
    | 'initial';
};

export type BoxVisibilityProps = {
  visibility?: 'visible' | 'hidden' | 'initial' | 'inherit';
};

export type BoxZIndexProps = {
  zIndex?: string;
};

type BoxCursorProps = {
  // Full list: https://www.w3schools.com/cssref/pr_class_cursor.php
  cursor?:
    | 'alias'
    | 'all-scroll'
    | 'auto'
    | 'cell'
    | 'col-resize'
    | 'context-menu'
    | 'copy'
    | 'crosshair'
    | 'default'
    | 'ew-resize'
    | 'grab'
    | 'grabbing'
    | 'help'
    | 'move'
    | 'none'
    | 'not-allowed'
    | 'pointer'
    | 'progress'
    | 'text'
    | 'wait'
    | 'zoom-in'
    | 'zoom-out';
};

type BoxAspectRatioProps = {
  aspectRatio?: string;
};

type BoxTransformProps = {
  transform?: string;
};

export type BoxProps = BoxColorProps &
  BoxShadowProps &
  BoxBackgroundProps &
  BoxPaddingProps &
  BoxMarginProps &
  BoxHeightProps &
  BoxWidthProps &
  BoxDisplayProps &
  BoxOverflowProps &
  BoxPositionProps &
  BoxFlexProps &
  BoxBorderProps &
  BoxVisibilityProps &
  BoxZIndexProps &
  BoxCursorProps &
  BoxAspectRatioProps &
  BoxTransformProps &
  React.HTMLAttributes<HTMLDivElement> &
  React.HTMLAttributes<HTMLQuoteElement>;

const Box = styled.div<BoxProps>`
  // colors and background
  ${(props) => css`
    ${props.color ? `color: ${props.color}` : ''};
    ${props.bgColor ? `background-color: ${props.bgColor}` : ''};
    ${props.background ? `background: ${props.background}` : ''};
    ${props.bg ? `background: ${props.bg}` : ''};
    ${typeof props.opacity === 'number' ? `opacity: ${props.opacity}` : ''};
  `}

  // shadow
  ${(props) => css`
    ${props.boxShadow ? `box-shadow: ${props.boxShadow}` : ''};
  `}

  // padding
  ${(props) => css`
    ${props.padding ? `padding: ${props.padding}` : ''};
    ${props.p ? `padding: ${props.p}` : ''};

    // top
    ${props.paddingY ? `padding-top: ${props.paddingY}` : ''};
    ${props.py ? `padding-top: ${props.py}` : ''};
    ${props.paddingTop ? `padding-top: ${props.paddingTop}` : ''};
    ${props.pt ? `padding-top: ${props.pt}` : ''};

    // bottom
    ${props.paddingY ? `padding-bottom: ${props.paddingY}` : ''};
    ${props.py ? `padding-bottom: ${props.py}` : ''};
    ${props.paddingBottom ? `padding-bottom: ${props.paddingBottom}` : ''};
    ${props.pb ? `padding-bottom: ${props.pb}` : ''};

    // left
    ${props.paddingX ? `padding-left: ${props.paddingX}` : ''};
    ${props.px ? `padding-left: ${props.px}` : ''};
    ${props.paddingLeft ? `padding-left: ${props.paddingLeft}` : ''};
    ${props.pl ? `padding-left: ${props.pl}` : ''};

    // right
    ${props.paddingX ? `padding-right: ${props.paddingX}` : ''};
    ${props.px ? `padding-right: ${props.px}` : ''};
    ${props.paddingRight ? `padding-right: ${props.paddingRight}` : ''};
    ${props.pr ? `padding-right: ${props.pr}` : ''};
  `}

  // margin
  ${(props) => css`
    ${props.margin ? `margin: ${props.margin}` : ''};
    ${props.m ? `margin: ${props.m}` : ''};

    // top
    ${props.marginY ? `margin-top: ${props.marginY}` : ''};
    ${props.my ? `margin-top: ${props.my}` : ''};
    ${props.marginTop ? `margin-top: ${props.marginTop}` : ''};
    ${props.mt ? `margin-top: ${props.mt}` : ''};

    // bottom
    ${props.marginY ? `margin-bottom: ${props.marginY}` : ''};
    ${props.my ? `margin-bottom: ${props.my}` : ''};
    ${props.marginBottom ? `margin-bottom: ${props.marginBottom}` : ''};
    ${props.mb ? `margin-bottom: ${props.mb}` : ''};

    // left
    ${props.marginX ? `margin-left: ${props.marginX}` : ''};
    ${props.mx ? `margin-left: ${props.mx}` : ''};
    ${props.marginLeft ? `margin-left: ${props.marginLeft}` : ''};
    ${props.ml ? `margin-left: ${props.ml}` : ''};

    // right
    ${props.marginX ? `margin-right: ${props.marginX}` : ''};
    ${props.mx ? `margin-right: ${props.mx}` : ''};
    ${props.marginRight ? `margin-right: ${props.marginRight}` : ''};
    ${props.mr ? `margin-right: ${props.mr}` : ''};
  `}

  // height
  ${(props) => css`
    ${props.height ? `height: ${props.height}` : ''};
    ${props.h ? `height: ${props.h}` : ''};
    ${props.maxHeight ? `max-height: ${props.maxHeight}` : ''};
    ${props.minHeight ? `min-height: ${props.minHeight}` : ''};
  `}

  // width
  ${(props) => css`
    ${props.width ? `width: ${props.width}` : ''};
    ${props.w ? `width: ${props.w}` : ''};
    ${props.maxWidth ? `max-width: ${props.maxWidth}` : ''};
    ${props.minWidth ? `min-width: ${props.minWidth}` : ''};
  `}

  // display
  ${(props) => css`
    ${props.display ? `display: ${props.display}` : ''};
  `}

  // overflow
  ${(props) => css`
    ${props.overflow ? `overflow: ${props.overflow}` : ''};
    ${props.overflowX ? `overflow-x: ${props.overflowX}` : ''};
    ${props.overflowY ? `overflow-y: ${props.overflowY}` : ''};
  `}

  // position
  ${(props) => css`
    ${props.position ? `position: ${props.position}` : ''};
    ${props.left ? `left: ${props.left}` : ''};
    ${props.right ? `right: ${props.right}` : ''};
    ${props.top ? `top: ${props.top}` : ''};
    ${props.bottom ? `bottom: ${props.bottom}` : ''};
  `}

 // flex
  ${(props) => css`
    ${props.flexDirection ? `flex-direction: ${props.flexDirection}` : ''};
    ${props.flexWrap ? `flex-wrap: ${props.flexWrap}` : ''};
    ${props.justifyContent ? `justify-content: ${props.justifyContent}` : ''};
    ${props.alignItems ? `align-items: ${props.alignItems}` : ''};
    ${props.alignContent ? `align-content: ${props.alignContent}` : ''};
    ${props.order ? `order: ${props.order}` : ''};
    ${props.flexGrow ? `flex-grow: ${props.flexGrow}` : ''};
    ${props.flexShrink ? `flex-shrink: ${props.flexShrink}` : ''};
    ${props.flexBasis ? `flex-basis: ${props.flexBasis}` : ''};
    ${props.flex ? `flex: ${props.flex}` : ''};
    ${props.alignSelf ? `align-self: ${props.alignSelf}` : ''};
    ${props.gap ? `gap: ${props.gap}` : ''};
  `}

 // border
  ${(props) => css`
    ${props.border ? `border: ${props.border}` : ''};
    ${props.borderTop ? `border-top: ${props.borderTop}` : ''};
    ${props.borderLeft ? `border-left: ${props.borderLeft}` : ''};
    ${props.borderRight ? `border-right: ${props.borderRight}` : ''};
    ${props.borderBottom ? `border-bottom: ${props.borderBottom}` : ''};
    ${props.borderWidth ? `border-width: ${props.borderWidth}` : ''};
    ${props.borderStyle ? `border-style: ${props.borderStyle}` : ''};
    ${props.borderRadius ? `border-radius: ${props.borderRadius}` : ''};
    ${props.borderColor ? `border-color: ${props.borderColor}` : ''};
  `}

 // visibility
  ${(props) => css`
    ${props.visibility ? `visibility: ${props.visibility}` : ''};
  `}

  // z-index
  ${(props) => css`
    ${props.zIndex ? `z-index: ${props.zIndex}` : ''};
  `}

  // cursor
  ${(props) => css`
    ${props.cursor ? `cursor: ${props.cursor}` : ''};
  `}

  // aspect ratio
  ${(props) => css`
    ${props.aspectRatio ? `aspect-ratio: ${props.aspectRatio}` : ''};
  `}

  // transformation
  ${(props) => css`
    ${props.transform ? `transform: ${props.transform}` : ''};
  `}
`;

export default Box;
