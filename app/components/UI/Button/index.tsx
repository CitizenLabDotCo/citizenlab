import React, { PureComponent, FormEvent, ButtonHTMLAttributes } from 'react';
import Link from 'utils/cl-router/Link';
import { isBoolean, isNil, isString, get } from 'lodash-es';
import styled, { withTheme } from 'styled-components';
import { darken, lighten, transparentize } from 'polished';
import { colors, invisibleA11yText, fontSizes } from 'utils/styleUtils';
import Spinner from 'components/UI/Spinner';
import Icon, { Props as IconProps, clColorTheme } from 'components/UI/Icon';

export type ButtonStyles =
  | 'primary'
  | 'primary-inverse'
  | 'primary-outlined'
  | 'secondary'
  | 'secondary-outlined'
  | 'white'
  | 'success'
  | 'text'
  | 'cl-blue'
  | 'cl-blue-outlined'
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
    iconColor?: string;
    iconHoverColor?: string;
    padding?: string;
  };
};

function getFontSize(props: ButtonContainerProps & { theme: any }) {
  if (props.fontSize) {
    return props.fontSize;
  } else {
    switch (props.size) {
      case '2':
        return `${fontSizes.large}px`;
      case '3':
        return `${fontSizes.xl}px`;
      default:
        return `${fontSizes.base}px`;
    }
  }
}

function getPadding(props: ButtonContainerProps & { theme: any }) {
  if (props.padding) {
    return props.padding;
  } else {
    switch (props.size) {
      case '2':
        return '11px 22px';
      case '3':
        return '13px 24px';
      case '4':
        return '15px 26px';
      default:
        // return '.65em 1.45em';
        return '9px 18px';
    }
  }
}

function getIconHeight(props: ButtonContainerProps & { theme: any }) {
  if (props.iconSize) {
    return props.iconSize;
  } else {
    switch (props.size) {
      case '2':
        return '18px';
      case '3':
        return '19px';
      case '4':
        return '20px';
      default:
        return '17px';
    }
  }
}

function getLineHeight(props: ButtonContainerProps & { theme: any }) {
  if (props.lineHeight) {
    return props.lineHeight;
  } else {
    switch (props.size) {
      case '2':
        return '24px';
      case '3':
        return '26px';
      case '4':
        return '28px';
      default:
        return '22px';
    }
  }
}

function getButtonStyle(props: ButtonContainerProps & { theme: any }) {
  const defaultStyleValues: DefaultStyleValues = {
    primary: {
      bgColor: get(props.theme, 'colorMain'),
      textColor: '#fff',
      textHoverColor: '#fff',
      iconColor: '#fff',
      iconHoverColor: '#fff',
    },
    'primary-outlined': {
      bgColor: 'transparent',
      bgHoverColor: transparentize(0.95, get(props.theme, 'colorMain')),
      textColor: get(props.theme, 'colorMain'),
      borderColor: get(props.theme, 'colorMain'),
    },
    'primary-inverse': {
      bgColor: '#fff',
      textColor: get(props.theme, 'colorText'),
      textHoverColor: get(props.theme, 'colorText'),
    },
    secondary: {
      bgColor: colors.lightGreyishBlue,
      textColor: darken(0.1, colors.label),
      borderColor: 'transparent',
      bgHoverColor: darken(0.05, colors.lightGreyishBlue),
    },
    'secondary-outlined': {
      bgColor: 'transparent',
      bgHoverColor: transparentize(0.95, colors.label),
      textColor: colors.label,
      borderColor: lighten(0.25, colors.label),
    },
    white: {
      bgColor: '#fff',
      bgHoverColor: '#fff',
      textColor: get(props.theme, 'colorText'),
      borderColor: '#ddd',
      borderHoverColor: darken(0.3, '#ddd'),
      iconColor: get(props.theme, 'colorMain'),
    },
    text: {
      bgColor: 'transparent',
      textColor: colors.label,
      iconColor: colors.label,
    },
    success: {
      bgColor: colors.clGreenSuccessBackground,
      textColor: colors.clGreenSuccess,
    },
    'cl-blue': {
      bgColor: colors.clBlueDark,
      textColor: '#fff',
      textHoverColor: '#fff',
      iconColor: '#fff',
      iconHoverColor: '#fff',
    },
    'cl-blue-outlined': {
      bgColor: 'transparent',
      bgHoverColor: 'transparent',
      textColor: colors.clBlueDark,
      borderColor: colors.clBlueDark,
    },
    'admin-dark': {
      bgColor: colors.adminTextColor,
      textColor: '#fff',
      textHoverColor: '#fff',
      iconColor: '#fff',
      iconHoverColor: '#fff',
    },
    'admin-dark-outlined': {
      bgColor: 'transparent',
      bgHoverColor: 'transparent',
      textColor: colors.adminTextColor,
      borderColor: colors.adminTextColor,
    },
    'admin-dark-text': {
      bgColor: 'transparent',
      textColor: colors.adminTextColor,
    },
    delete: {
      bgColor: colors.clRedError,
      textColor: '#fff',
      textHoverColor: '#fff',
      iconColor: '#fff',
      iconHoverColor: '#fff',
    },
  };

  const backgroundColor =
    props.bgColor || get(defaultStyleValues, `${props.buttonStyle}.bgColor`);
  const backgroundHoverColor =
    props.bgHoverColor ||
    get(defaultStyleValues, `${props.buttonStyle}.bgHoverColor`) ||
    darken(0.12, backgroundColor);
  const backgroundDisabledColor =
    props.bgDisabledColor ||
    get(defaultStyleValues, `${props.buttonStyle}.bgDisabledColor`) ||
    backgroundColor;
  const textColor =
    props.textColor ||
    get(defaultStyleValues, `${props.buttonStyle}.textColor`);
  const textHoverColor =
    props.textHoverColor ||
    get(defaultStyleValues, `${props.buttonStyle}.textHoverColor`) ||
    darken(0.2, textColor);
  const iconColor =
    props.iconColor ||
    get(defaultStyleValues, `${props.buttonStyle}.iconColor`) ||
    textColor;
  const iconHoverColor =
    props.iconHoverColor ||
    get(defaultStyleValues, `${props.buttonStyle}.iconHoverColor`) ||
    darken(0.2, iconColor);
  const textDisabledColor =
    props.textDisabledColor ||
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
    get(defaultStyleValues, `${props.buttonStyle}.borderRadius`) ||
    props.theme.borderRadius;
  const textDecoration =
    props.textDecoration ||
    get(defaultStyleValues, `${props.buttonStyle}.textDecoration`) ||
    'none';
  const textDecorationHover =
    props.textDecorationHover ||
    get(defaultStyleValues, `${props.buttonStyle}.textDecorationHover`) ||
    'none';
  const padding =
    get(defaultStyleValues, `${props.buttonStyle}.padding`) ||
    getPadding(props);
  const fontSize = getFontSize(props);
  const lineHeight = getLineHeight(props);
  const iconSize = getIconHeight(props);
  const fontWeight = props.fontWeight || 'normal';
  const borderWidth = props.borderThickness || '1px';
  const display = !props.width ? 'inline-flex' : 'flex';
  const height = props.height || 'auto';
  const justifyContent = props.justify || 'center';
  const minWidth = props.minWidth || 'auto';
  const width = props.width || '100%';
  const buttonTextOpacity = props.processing ? 0 : 1;
  const iconOpacity = props.processing ? 0 : 1;
  const whiteSpace = props.whiteSpace || 'nowrap';
  const opacityDisabled = props.opacityDisabled || '0.37';

  return `
    width: ${width};
    min-width: ${minWidth};
    height: ${height};
    display: ${display};
    align-items: center;
    justify-content: ${justifyContent};
    margin: 0;
    padding: ${padding};
    position: relative;
    border-radius: ${borderRadius};
    background: ${backgroundColor};
    border-width: ${borderWidth};
    border-style: solid;
    border-color: ${borderColor};
    box-shadow: ${boxShadow};
    cursor: pointer;
    transition: background 80ms ease-out, border-color 80ms ease-out, box-shadow 80ms ease-out;

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
    }

    ${StyledIcon} {
      fill: ${iconColor};
      flex: 0 0 ${iconSize};
      height: ${iconSize};
      width: ${iconSize};
      opacity: ${iconOpacity};
      transition: fill 80ms ease-out;
    }

    &:not(.disabled):not(.processing):hover,
    &:not(.disabled):not(.processing):focus {
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
  `;
}

const StyledButton = styled.button``;
const StyledLink = styled(Link)``;
const StyledA = styled.a``;
const ButtonText = styled.div``;
const StyledIcon = styled(Icon)`
  &.hasText {
    &.left {
      margin-right: 10px;
    }

    &.right {
      margin-left: 10px;
    }
  }
`;

const Container = styled.div<ButtonContainerProps>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => props.justifyWrapper || 'center'};
  margin: 0;
  padding: 0;
  user-select: none;

  &.fullWidth {
    width: 100%;
  }

  ${StyledButton},
  ${StyledLink},
  ${StyledA} {
    ${(props) => getButtonStyle(props)}
  }
`;

const SpinnerWrapper = styled.div`
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

export interface ButtonContainerProps {
  id?: string;
  buttonStyle?: ButtonStyles;
  size?: '1' | '2' | '3' | '4';
  width?: string;
  height?: string;
  fullWidth?: boolean;
  padding?: string;
  justify?: 'left' | 'center' | 'right' | 'space-between';
  justifyWrapper?: 'left' | 'center' | 'right' | 'space-between';
  iconSize?: string;
  processing?: boolean;
  disabled?: boolean;
  iconColor?: string;
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
  onClick?: (arg: FormEvent<HTMLButtonElement>) => void;
}

export interface Props extends ButtonContainerProps {
  children?: any;
  className?: string;
  form?: string;
  hiddenText?: string | JSX.Element;
  icon?: IconProps['name'];
  iconPos?: 'left' | 'right';
  iconTitle?: IconProps['title'];
  iconTheme?: clColorTheme;
  linkTo?: string;
  openInNewTab?: boolean;
  setSubmitButtonRef?: (value: any) => void;
  text?: string | JSX.Element;
  theme?: object | undefined;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  spinnerColor?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
  fontSize?: string;
  ariaExpanded?: boolean;
  ariaDescribedby?: string;
  iconAriaHidden?: boolean;
  ariaDisabled?: boolean;
}

interface State {}

export class Button extends PureComponent<Props, State> {
  handleOnClick = (event) => {
    const { onClick, processing, disabled } = this.props;

    if (onClick) {
      event.preventDefault();
      event.stopPropagation();

      if (!disabled && !processing) {
        onClick(event);
      }
    }
  };

  removeFocus = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  getSpinnerSize = (size) => {
    switch (size) {
      case '2':
        return '26px';
      case '3':
        return '28px';
      case '4':
        return '30px';
      default:
        return '24px';
    }
  };

  getSpinnerColor = (buttonStyle: ButtonStyles) => {
    if (
      buttonStyle === 'primary-outlined' ||
      buttonStyle === 'secondary-outlined'
    ) {
      const theme = this.props.theme as object;
      return theme['colorMain'];
    }

    if (buttonStyle === 'secondary') {
      const theme = this.props.theme as object;
      return theme['colors']['label'];
    }

    return '#fff';
  };

  render() {
    const {
      type,
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
      minWidth,
      width,
      height,
      padding,
      justify,
      justifyWrapper,
      icon,
      iconSize,
      iconTitle,
      iconTheme,
      hiddenText,
      children,
      linkTo,
      openInNewTab,
      fontWeight,
      lineHeight,
      textDecoration,
      textDecorationHover,
      whiteSpace,
      fullWidth,
      ariaLabel,
      fontSize,
      autoFocus,
      ariaExpanded,
      iconAriaHidden,
      ariaDescribedby,
      ariaDisabled,
      opacityDisabled,
      className,
    } = this.props;

    const id = this.props.id || '';
    const size = this.props.size || '1';
    const processing = isBoolean(this.props.processing)
      ? this.props.processing
      : false;
    const buttonStyle = this.props.buttonStyle || 'primary';
    const disabled = isBoolean(this.props.disabled)
      ? this.props.disabled
      : false;
    const iconPos = this.props.iconPos || 'left';
    const spinnerSize = this.getSpinnerSize(size);
    const spinnerColor =
      this.props.spinnerColor || textColor || this.getSpinnerColor(buttonStyle);
    const hasText = !isNil(text) || !isNil(children);
    const containerClassNames = [
      className,
      disabled ? 'disabled' : null,
      processing ? 'processing' : null,
      fullWidth ? 'fullWidth' : null,
    ]
      .filter((item) => !isNil(item))
      .join(' ');
    const buttonClassNames = [
      'button',
      'Button',
      buttonStyle,
      disabled ? 'disabled' : null,
      processing ? 'processing' : null,
      fullWidth ? 'fullWidth' : null,
    ]
      .filter((item) => !isNil(item))
      .join(' ');

    const childContent = (
      <>
        {icon && iconPos === 'left' && (
          <StyledIcon
            name={icon}
            className={`buttonIcon ${iconPos} ${hasText && 'hasText'}`}
            title={iconTitle}
            colorTheme={iconTheme}
            ariaHidden={iconAriaHidden}
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
            title={iconTitle}
            colorTheme={iconTheme}
            ariaHidden={iconAriaHidden}
          />
        )}
        {processing && (
          <SpinnerWrapper>
            <Spinner size={spinnerSize} color={spinnerColor} />
          </SpinnerWrapper>
        )}
      </>
    );

    return (
      <Container
        className={containerClassNames}
        onClick={this.handleOnClick}
        onMouseDown={this.removeFocus}
        buttonStyle={buttonStyle}
        id={id}
        size={size}
        width={width}
        height={height}
        padding={padding}
        justify={justify}
        justifyWrapper={justifyWrapper}
        iconSize={iconSize}
        processing={processing}
        disabled={disabled}
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
        minWidth={minWidth}
        fontSize={fontSize}
        opacityDisabled={opacityDisabled}
      >
        {linkTo && !disabled ? (
          isString(linkTo) && linkTo.startsWith('http') ? (
            <StyledA
              ref={this.props.setSubmitButtonRef}
              href={linkTo}
              target={openInNewTab ? '_blank' : '_self'}
              className={buttonClassNames}
              aria-label={ariaLabel}
            >
              {childContent}
            </StyledA>
          ) : (
            <StyledLink
              ref={this.props.setSubmitButtonRef}
              to={linkTo}
              className={buttonClassNames}
              aria-label={ariaLabel}
            >
              {childContent}
            </StyledLink>
          )
        ) : (
          <StyledButton
            aria-label={ariaLabel}
            aria-expanded={ariaExpanded}
            aria-describedby={ariaDescribedby}
            aria-disabled={ariaDisabled}
            disabled={disabled}
            ref={this.props.setSubmitButtonRef}
            className={buttonClassNames}
            form={form}
            type={type ? type : 'submit'}
            autoFocus={autoFocus}
          >
            {childContent}
          </StyledButton>
        )}
      </Container>
    );
  }
}

export default withTheme(Button);
