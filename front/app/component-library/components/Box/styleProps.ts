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

export type BoxCursorProps = {
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

export type BoxAspectRatioProps = {
  aspectRatio?: string;
};

export type BoxTransformProps = {
  transform?: string;
};

export type BoxPointerEventsProps = {
  pointerEvents?: 'auto' | 'none' | 'initial' | 'inherit';
};

// The style-only subset of BoxProps — every prop consumed by Box's CSS
// interpolations. Kept separate from BoxProps because BoxProps also includes
// React.HTMLAttributes (id, className, onClick, etc.) which we DO want
// forwarded to the DOM.
export type BoxStyleProps = BoxColorProps &
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
  BoxPointerEventsProps;

// Required<Record<keyof BoxStyleProps, true>> forces TypeScript to fail if a
// new key is added to any BoxStyleProps sub-type and not listed here, or if
// a key is removed from a sub-type but left here. The runtime filter Set is
// derived from this map's keys, so it cannot drift from the types.
const styleOnlyPropMap: Required<Record<keyof BoxStyleProps, true>> = {
  color: true,
  bgColor: true,
  opacity: true,
  bg: true,
  background: true,
  padding: true,
  p: true,
  paddingLeft: true,
  pl: true,
  paddingRight: true,
  pr: true,
  paddingTop: true,
  pt: true,
  paddingBottom: true,
  pb: true,
  paddingX: true,
  px: true,
  paddingY: true,
  py: true,
  margin: true,
  m: true,
  marginLeft: true,
  ml: true,
  marginRight: true,
  mr: true,
  marginTop: true,
  mt: true,
  marginBottom: true,
  mb: true,
  marginX: true,
  mx: true,
  marginY: true,
  my: true,
  height: true,
  h: true,
  maxHeight: true,
  minHeight: true,
  width: true,
  w: true,
  maxWidth: true,
  minWidth: true,
  boxShadow: true,
  display: true,
  overflow: true,
  overflowX: true,
  overflowY: true,
  position: true,
  top: true,
  bottom: true,
  left: true,
  right: true,
  flexDirection: true,
  flexWrap: true,
  alignItems: true,
  justifyContent: true,
  alignContent: true,
  order: true,
  flexGrow: true,
  flexShrink: true,
  flexBasis: true,
  flex: true,
  alignSelf: true,
  gap: true,
  border: true,
  borderTop: true,
  borderBottom: true,
  borderLeft: true,
  borderRight: true,
  borderColor: true,
  borderWidth: true,
  borderRadius: true,
  borderStyle: true,
  visibility: true,
  zIndex: true,
  cursor: true,
  aspectRatio: true,
  transform: true,
  pointerEvents: true,
};

export const styleOnlyProps = new Set<string>(Object.keys(styleOnlyPropMap));
