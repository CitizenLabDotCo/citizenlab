import React, { MouseEvent, ButtonHTMLAttributes, forwardRef } from 'react';

import { isNil, get } from 'lodash-es';
import { darken, transparentize, opacify, rgba } from 'polished';
import styled from 'styled-components';

import {
  colors,
  invisibleA11yText,
  fontSizes,
  defaultStyles,
  isRtl,
  MainThemeProps,
} from '../../utils/styleUtils';
import Box, {
  BoxMarginProps,
  BoxPaddingProps,
  BoxPositionProps,
  BoxWidthProps,
  BoxHeightProps,
} from '../Box';
import Icon, { IconProps } from '../Icon';
import Spinner from '../Spinner';

export type ButtonStyles =
  | 'primary'
  | 'primary-inverse'
  | 'primary-outlined'
  | 'secondary'
  | 'secondary-outlined'
  | 'white'
  | 'text'
  | 'admin-dark'
  | 'admin-dark-outlined'
  | 'admin-dark-text'
  | 'delete';

type DefaultStyleValues = {
  [key in ButtonStyles]: {
    bgColor: string;
    bgHoverColor?: string;
    textColor: string;
    textHoverColor?: string;
    borderColor?: string;
    borderHoverColor?: string;
    boxShadow?: string;
    boxShadowHover?: string;
    iconColor?: string;
    iconHoverColor?: string;
    padding?: string;
  };
};

function getFontSize(props: ButtonContainerProps & { theme: MainThemeProps }) {
  if (props.fontSize) {
    return props.fontSize;
  } else {
    switch (props.size) {
      case 'm':
        return `${fontSizes.l}px`;
      case 'l':
        return `${fontSizes.xl}px`;
      default:
        return `${fontSizes.base}px`;
    }
  }
}

function getPadding(props: ButtonContainerProps & { theme: MainThemeProps }) {
  if (props.padding) {
    return props.padding;
  } else if (props.p) {
    return props.p;
  } else {
    switch (props.size) {
      case 'm':
        return '11px 22px';
      case 'l':
        return '13px 24px';
      case 'xl':
        return '15px 26px';
      default:
        // return '.65em 1.45em';
        return '9px 18px';
    }
  }
}

function getLineHeight(
  props: ButtonContainerProps & { theme: MainThemeProps }
) {
  if (props.lineHeight) {
    return props.lineHeight;
  } else {
    switch (props.size) {
      case 'xl':
        return '28px';
      default:
        return '26px';
    }
  }
}

function getButtonStyle(
  props: ButtonContainerProps & { theme: MainThemeProps }
) {
  const defaultStyleValues: DefaultStyleValues = {
    primary: {
      bgColor: get(props.theme.colors, 'tenantPrimary'),
      textColor: '#fff',
      textHoverColor: '#fff',
      iconColor: '#fff',
      iconHoverColor: '#fff',
    },
    'primary-outlined': {
      bgColor: 'transparent',
      bgHoverColor: transparentize(
        0.95,
        get(props.theme.colors, 'tenantPrimary')
      ),
      textColor: get(props.theme.colors, 'tenantPrimary'),
      borderColor: get(props.theme.colors, 'tenantPrimary'),
    },
    'primary-inverse': {
      bgColor: '#fff',
      textColor: get(props.theme.colors, 'tenantText'),
      textHoverColor: get(props.theme.colors, 'tenantText'),
    },
    // Duplicates the secondary-outlined style for now to avoid breaking changes to the content builder components
    secondary: {
      bgColor: 'transparent',
      bgHoverColor: transparentize(0.95, colors.textSecondary),
      textColor: colors.textSecondary,
      borderColor: colors.textSecondary,
    },
    'secondary-outlined': {
      bgColor: 'transparent',
      bgHoverColor: transparentize(0.95, colors.textSecondary),
      textColor: colors.textSecondary,
      borderColor: colors.textSecondary,
    },
    white: {
      bgColor: '#fff',
      bgHoverColor: '#fff',
      iconColor: colors.textSecondary,
      textColor: get(props.theme.colors, 'tenantText'),
      borderColor: 'transparent',
      boxShadow: defaultStyles.boxShadow,
      boxShadowHover: defaultStyles.boxShadowHoverSmall,
    },
    text: {
      bgColor: 'transparent',
      bgHoverColor: 'transparent',
      textColor: colors.textSecondary,
      iconColor: colors.textSecondary,
    },

    'admin-dark': {
      bgColor: colors.primary,
      textColor: '#fff',
      textHoverColor: '#fff',
      iconColor: '#fff',
      iconHoverColor: '#fff',
    },
    'admin-dark-outlined': {
      bgColor: 'transparent',
      bgHoverColor: 'transparent',
      textColor: colors.primary,
      borderColor: colors.primary,
    },
    'admin-dark-text': {
      bgColor: 'transparent',
      bgHoverColor: rgba(colors.primary, 0.1),
      textColor: colors.primary,
    },
    delete: {
      bgColor: colors.red600,
      textColor: '#fff',
      textHoverColor: '#fff',
      iconColor: '#fff',
      iconHoverColor: '#fff',
    },
  };

  const backgroundColor =
    props.bgColor ||
    (get(defaultStyleValues, `${props.buttonStyle}.bgColor`) as string);

  const backgroundHoverColor =
    props.bgHoverColor ||
    get(defaultStyleValues, `${props.buttonStyle}.bgHoverColor`) ||
    darken(0.12, backgroundColor);
  const backgroundActiveColor =
    backgroundHoverColor !== 'transparent'
      ? // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        backgroundHoverColor?.startsWith('rgba')
        ? opacify(0.12, backgroundHoverColor)
        : darken(0.12, backgroundHoverColor)
      : 'inherit';
  const backgroundDisabledColor =
    props.bgDisabledColor ||
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get(defaultStyleValues, `${props.buttonStyle}.bgDisabledColor`) ||
    backgroundColor;
  const textColor =
    props.textColor ||
    (get(defaultStyleValues, `${props.buttonStyle}.textColor`) as string);
  const textHoverColor =
    props.textHoverColor ||
    get(defaultStyleValues, `${props.buttonStyle}.textHoverColor`) ||
    darken(0.2, textColor);
  const iconColor =
    props.iconColor ||
    get(defaultStyleValues, `${props.buttonStyle}.iconColor`) ||
    (textColor as string);
  const iconHoverColor =
    props.iconHoverColor ||
    get(defaultStyleValues, `${props.buttonStyle}.iconHoverColor`) ||
    darken(0.2, iconColor);
  const textDisabledColor =
    props.textDisabledColor ||
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get(defaultStyleValues, `${props.buttonStyle}.textDisabledColor`) ||
    textColor;
  const borderColor =
    props.borderColor ||
    get(defaultStyleValues, `${props.buttonStyle}.borderColor`) ||
    'transparent';
  const borderHoverColor =
    props.borderHoverColor ||
    get(defaultStyleValues, `${props.buttonStyle}.borderHoverColor`) ||
    darken(0.2, borderColor);
  const borderDisabledColor =
    props.borderDisabledColor ||
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get(defaultStyleValues, `${props.buttonStyle}.borderDisabledColor`) ||
    borderColor;
  const boxShadow =
    props.boxShadow ||
    get(defaultStyleValues, `${props.buttonStyle}.boxShadow`) ||
    'none';
  const boxShadowHover =
    props.boxShadowHover ||
    get(defaultStyleValues, `${props.buttonStyle}.boxShadowHover`) ||
    'none';
  const borderRadius =
    props.borderRadius ||
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get(defaultStyleValues, `${props.buttonStyle}.borderRadius`) ||
    props.theme.borderRadius;
  const textDecoration =
    props.textDecoration ||
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get(defaultStyleValues, `${props.buttonStyle}.textDecoration`) ||
    'none';
  const textDecorationHover =
    props.textDecorationHover ||
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get(defaultStyleValues, `${props.buttonStyle}.textDecorationHover`) ||
    'none';
  const padding =
    get(defaultStyleValues, `${props.buttonStyle}.padding`) ||
    getPadding(props);
  const fontSize = getFontSize(props);
  const lineHeight = getLineHeight(props);
  const fontWeight = props.fontWeight || 'normal';
  const borderWidth = props.borderThickness || '1px';
  const display = !props.width ? 'inline-flex' : 'flex';
  const height = props.height || props.h || 'auto';
  const minHeight = props.minHeight || 'initial';
  const maxHeight = props.maxHeight || 'initial';
  const justifyContent = props.justify || 'center';
  const minWidth = props.minWidth || 'initial';
  const maxWidth = props.maxWidth || 'initial';
  const width = props.width || props.w || '100%';
  const buttonTextOpacity = props.processing ? 0 : 1;
  const iconOpacity = props.processing ? 0 : 1;
  const iconSize = props.iconSize ? props.iconSize : '24px';
  const whiteSpace = props.whiteSpace || 'nowrap';
  const opacityDisabled = props.opacityDisabled || '0.37';
  const flexDirection = props.theme.isRtl ? 'row-reverse' : 'row';

  return `
    width: ${width};
    min-width: ${minWidth};
    max-width: ${maxWidth};
    height: ${height};
    min-height: ${minHeight};
    max-height: ${maxHeight};
    display: ${display};
    align-items: center;
    justify-content: ${justifyContent};
    margin: 0;
    position: relative;
    border-radius: ${borderRadius};
    background: ${backgroundColor};
    border-width: ${borderWidth};
    border-style: solid;
    border-color: ${borderColor};
    box-shadow: ${boxShadow};
    cursor: pointer;
    transition: background 80ms ease-out, border-color 80ms ease-out, box-shadow 125ms ease-in-out 0s;
    flex-direction: ${flexDirection};

    // padding
    padding: ${padding};
    ${props.paddingY ? `padding-top: ${props.paddingY}` : ''};
    ${props.py ? `padding-top: ${props.py}` : ''};
    ${props.paddingTop ? `padding-top: ${props.paddingTop}` : ''};
    ${props.pt ? `padding-top: ${props.pt}` : ''};
    ${props.paddingY ? `padding-bottom: ${props.paddingY}` : ''};
    ${props.py ? `padding-bottom: ${props.py}` : ''};
    ${props.paddingBottom ? `padding-bottom: ${props.paddingBottom}` : ''};
    ${props.pb ? `padding-bottom: ${props.pb}` : ''};
    ${props.paddingX ? `padding-left: ${props.paddingX}` : ''};
    ${props.px ? `padding-left: ${props.px}` : ''};
    ${props.paddingLeft ? `padding-left: ${props.paddingLeft}` : ''};
    ${props.pl ? `padding-left: ${props.pl}` : ''};
    ${props.paddingX ? `padding-right: ${props.paddingX}` : ''};
    ${props.px ? `padding-right: ${props.px}` : ''};
    ${props.paddingRight ? `padding-right: ${props.paddingRight}` : ''};
    ${props.pr ? `padding-right: ${props.pr}` : ''};

    ${ButtonText} {
      color: ${textColor};
      opacity: ${buttonTextOpacity};
      font-size: ${fontSize};
      line-height: ${lineHeight};
      font-weight: ${fontWeight};
      text-decoration: ${textDecoration};
      white-space: ${whiteSpace};
      text-align: left;
      margin: 0;
      margin-top: -1px;
      padding: 0;
      transition: color 80ms ease-out;

      ${isRtl`
        text-align: right;
      `}
    }

    ${StyledIcon} {
      fill: ${iconColor};
      flex: 0 0 ${iconSize};
      height: ${iconSize};
      width: ${iconSize};
      opacity: ${iconOpacity};
      transition: fill 80ms ease-out;
    }

    &:not(.disabled):not(.processing):active {
      background: ${backgroundActiveColor} !important;
    }

    &:not(.disabled):not(.processing):hover {
      background: ${backgroundHoverColor};
      border-color: ${borderHoverColor};
      box-shadow: ${boxShadowHover};

      ${ButtonText} {
        color: ${textHoverColor};
        text-decoration: ${textDecorationHover};
      }

      ${StyledIcon} {
        fill: ${iconHoverColor};
      }
    }

    &.fullWidth {
      flex: 1;
      width: 100%;
    }

    &.disabled {
      background: ${backgroundDisabledColor};
      border-color: ${borderDisabledColor};
      opacity: ${opacityDisabled};
      cursor: not-allowed;

      ${ButtonText} {
        color: ${textDisabledColor};
      }

      ${StyledIcon} {
        fill: ${textDisabledColor};
      }
    }

    & .spinner {
      border-color: ${textColor} !important;
      border-right-color: transparent !important;
    }
  `;
}

const StyledButton = styled.button``;
const ButtonText = styled.span``;
const StyledIcon = styled(Icon)`
  &.hasText {
    &.left {
      margin-right: 8px;
    }

    &.right {
      margin-left: 8px;
    }
  }

  ${isRtl`
        &.hasText {
            &.left {
            margin-right: 0px;
            margin-left: 8px;
            }

            &.right {
            margin-left: 0px;
            margin-right: 8px;
            }
        }
        `}
`;

const Container = styled(Box)<ButtonContainerProps>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => props.justifyWrapper || 'center'};
  padding: 0;
  user-select: none;
  background-color: transparent;

  &.fullWidth {
    width: 100%;
  }

  ${StyledButton} {
    ${(props) => getButtonStyle(props)}
  }
`;

const SpinnerWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0px;
`;

const HiddenText = styled.span`
  ${invisibleA11yText()}
`;

type Size = 's' | 'm' | 'l' | 'xl' | undefined;

export type ButtonContainerProps = {
  buttonStyle?: ButtonStyles;
  size?: Size;
  width?: string;
  height?: string;
  fullWidth?: boolean;
  padding?: string;
  justify?: 'left' | 'center' | 'right' | 'space-between';
  justifyWrapper?: 'left' | 'center' | 'right' | 'space-between';
  processing?: boolean;
  disabled?: boolean;
  iconColor?: string;
  iconSize?: string;
  iconHoverColor?: string;
  textColor?: string;
  textHoverColor?: string;
  textDisabledColor?: string;
  bgColor?: string;
  bgHoverColor?: string;
  bgDisabledColor?: string;
  borderColor?: string;
  borderHoverColor?: string;
  borderDisabledColor?: string;
  borderThickness?: string;
  boxShadow?: string;
  boxShadowHover?: string;
  borderRadius?: string;
  fontWeight?: string;
  lineHeight?: string;
  textDecoration?: string;
  textDecorationHover?: string;
  whiteSpace?: string;
  minWidth?: string;
  fontSize?: string;
  opacityDisabled?: string;
  onClick?: (arg: MouseEvent) => void;
} & BoxMarginProps &
  BoxPaddingProps &
  BoxPositionProps &
  BoxWidthProps &
  BoxHeightProps &
  React.HTMLAttributes<HTMLDivElement> &
  React.HTMLAttributes<HTMLElement>;

export interface Props extends ButtonContainerProps {
  children?: React.ReactNode;
  className?: string;
  form?: string;
  hiddenText?: string | JSX.Element;
  icon?: IconProps['name'];
  iconPos?: 'left' | 'right';
  text?: string | JSX.Element;
  theme?: MainThemeProps | undefined;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  spinnerColor?: string;
  role?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  fontSize?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  ariaDescribedby?: string;
  ariaControls?: string;
  as?: React.ElementType;
  tabIndex?: number;
}
export type Ref = HTMLButtonElement;

const Button = forwardRef<Ref, Props>((props, ref) => {
  const handleOnClick = (event: MouseEvent<HTMLElement>) => {
    const { onClick, processing, disabled } = props;

    if (onClick) {
      event.preventDefault();
      event.stopPropagation();

      if (!disabled && !processing) {
        onClick(event);
      }
    }
  };

  const getSpinnerSize = (size: Size) => {
    switch (size) {
      case 'm':
        return '26px';
      case 'l':
        return '28px';
      case 'xl':
        return '30px';
      default:
        return '24px';
    }
  };

  const {
    type = 'submit',
    text,
    form,
    iconColor,
    iconHoverColor,
    textColor,
    textHoverColor,
    textDisabledColor,
    bgColor,
    bgHoverColor,
    bgDisabledColor,
    borderColor,
    borderHoverColor,
    borderDisabledColor,
    borderThickness,
    boxShadow,
    boxShadowHover,
    borderRadius,
    justify,
    justifyWrapper,
    icon,
    hiddenText,
    children,
    fontWeight,
    lineHeight,
    textDecoration,
    textDecorationHover,
    whiteSpace,
    fullWidth,
    role,
    ariaLabel,
    fontSize,
    autoFocus,
    ariaExpanded,
    ariaPressed,
    ariaDescribedby,
    ariaControls,
    opacityDisabled,
    className,
    onClick: _onClick,
    processing = false,
    disabled = false,
    tabIndex,
    as,
    ...rest
  } = props;

  const id = props.id || '';
  const size = props.size || 's';
  const buttonStyle = props.buttonStyle || 'primary';
  const iconPos = props.iconPos || 'left';
  const spinnerSize = getSpinnerSize(size);
  const hasText = !isNil(text) || !isNil(children);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const buttonType = type && !as ? type : undefined;
  const containerClassNames = [
    className,
    disabled ? 'disabled' : null,
    processing ? 'processing' : null,
    fullWidth ? 'fullWidth' : null,
  ]
    .filter((item: any) => !isNil(item))
    .join(' ');
  const buttonClassNames = [
    'button',
    'Button',
    buttonStyle,
    disabled ? 'disabled' : null,
    processing ? 'processing' : null,
    fullWidth ? 'fullWidth' : null,
  ]
    .filter((item: any) => !isNil(item))
    .join(' ');

  const childContent = (
    <>
      {icon && iconPos === 'left' && (
        <StyledIcon
          name={icon}
          className={`buttonIcon ${iconPos} ${hasText && 'hasText'}`}
        />
      )}
      {hasText && (
        <ButtonText className="buttonText">{text || children}</ButtonText>
      )}
      {hiddenText && <HiddenText>{hiddenText}</HiddenText>}
      {icon && iconPos === 'right' && (
        <StyledIcon
          name={icon}
          className={`buttonIcon ${iconPos} ${hasText && 'hasText'}`}
        />
      )}
      {processing && (
        <SpinnerWrapper>
          <Spinner size={spinnerSize} />
        </SpinnerWrapper>
      )}
    </>
  );

  return (
    <Container
      onClick={handleOnClick}
      className={containerClassNames}
      buttonStyle={buttonStyle}
      id={id}
      size={size}
      justify={justify}
      justifyWrapper={justifyWrapper}
      processing={processing}
      iconColor={iconColor}
      iconHoverColor={iconHoverColor}
      textColor={textColor}
      textHoverColor={textHoverColor}
      textDisabledColor={textDisabledColor}
      bgColor={bgColor}
      bgHoverColor={bgHoverColor}
      bgDisabledColor={bgDisabledColor}
      borderColor={borderColor}
      borderHoverColor={borderHoverColor}
      borderDisabledColor={borderDisabledColor}
      borderThickness={borderThickness}
      boxShadow={boxShadow}
      boxShadowHover={boxShadowHover}
      borderRadius={borderRadius}
      fontWeight={fontWeight}
      lineHeight={lineHeight}
      textDecoration={textDecoration}
      textDecorationHover={textDecorationHover}
      whiteSpace={whiteSpace}
      fontSize={fontSize}
      opacityDisabled={opacityDisabled}
      {...rest}
    >
      <StyledButton
        role={role}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        aria-describedby={ariaDescribedby}
        aria-controls={ariaControls}
        aria-disabled={disabled || processing}
        className={buttonClassNames}
        form={form}
        type={buttonType}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        as={as}
        tabIndex={tabIndex}
        ref={ref}
      >
        {childContent}
      </StyledButton>
    </Container>
  );
});

export default Button;
