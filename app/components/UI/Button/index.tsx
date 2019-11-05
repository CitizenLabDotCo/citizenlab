import React, { PureComponent, FormEvent, ButtonHTMLAttributes } from 'react';
import Link from 'utils/cl-router/Link';
import { isBoolean, isNil, isString, get } from 'lodash-es';
import styled, { withTheme } from 'styled-components';
import { darken } from 'polished';
import { colors, invisibleA11yText, fontSizes } from 'utils/styleUtils';
import Spinner from 'components/UI/Spinner';
import Icon, { Props as IconProps, clColorTheme } from 'components/UI/Icon';

export type ButtonStyles =
  'primary'
  | 'primary-inverse'
  | 'primary-outlined'
  | 'secondary'
  | 'secondary-outlined'
  | 'success'
  | 'text'
  | 'cl-blue'
  | 'admin-dark'
  | 'delete';

type DefaultStyleValues = {
  [key in ButtonStyles]: {
    bgColor: string;
    bgHoverColor?: string;
    textColor: string;
    textHoverColor?: string;
    borderColor?: string;
    borderHoverColor?: string;
  };
};

function getFontSize(size) {
  switch (size) {
    case '2':
      return `${fontSizes.large}px`;
    case '3':
      return `${fontSizes.xl}px`;
    default:
      return `${fontSizes.base}px`;
  }
}

function getPadding(size) {
  switch (size) {
    case '2':
      return '11px 22px';
    case '3':
      return '13px 24px';
    case '4':
      return '15px 26px';
    default:
      return '.65em 1.45em';
  }
}

function getIconHeight(size) {
  switch (size) {
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

function getLineHeight(size) {
  switch (size) {
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

function getButtonStyle(props: ButtonContainerProps & { theme: any }) {

  const defaultStyleValues: DefaultStyleValues = {
    primary: {
      bgColor: get(props.theme, 'colorMain'),
      textColor: '#fff',
      textHoverColor: '#fff'
    },
    'primary-outlined': {
      bgColor: 'transparent',
      bgHoverColor: 'transparent',
      textColor: get(props.theme, 'colorMain'),
      borderColor: get(props.theme, 'colorMain'),
    },
    'primary-inverse': {
      bgColor: '#fff',
      textColor: get(props.theme, 'colorText'),
      textHoverColor: get(props.theme, 'colorText')
    },
    secondary: {
      bgColor: colors.lightGreyishBlue,
      textColor: darken(0.1, colors.label),
      borderColor: 'transparent',
      bgHoverColor: darken(0.05, colors.lightGreyishBlue)
    },
    'secondary-outlined': {
      bgColor: 'transparent',
      bgHoverColor: 'transparent',
      textColor: colors.label,
      borderColor: colors.label
    },
    text: {
      bgColor: 'transparent',
      textColor: colors.label
    },
    success: {
      bgColor: colors.clGreenSuccessBackground,
      textColor: colors.clGreenSuccess
    },
    'cl-blue': {
      bgColor: colors.clBlueDark,
      textColor: '#fff',
      textHoverColor: '#fff'
    },
    'admin-dark': {
      bgColor: colors.adminTextColor,
      textColor: '#fff',
      textHoverColor: '#fff'
    },
    delete: {
      bgColor: colors.clRedError,
      textColor: '#fff',
      textHoverColor: '#fff'
    }
  };

  const finalBgColor = props.bgColor || get(defaultStyleValues, `${props.buttonStyle}.bgColor`);
  const finalBgHoverColor = props.bgHoverColor || get(defaultStyleValues, `${props.buttonStyle}.bgHoverColor`) || darken(0.12, finalBgColor);
  const finalTextColor = props.textColor || get(defaultStyleValues, `${props.buttonStyle}.textColor`);
  const finalTextHoverColor = props.textHoverColor || get(defaultStyleValues, `${props.buttonStyle}.textHoverColor`) || darken(0.2, finalTextColor);
  const finalIconColor = props.iconColor || get(defaultStyleValues, `${props.buttonStyle}.iconColor`) || finalTextColor;
  const finalIconHoverColor = props.iconHoverColor || get(defaultStyleValues, `${props.buttonStyle}.iconHoverColor`) || finalTextHoverColor;
  const finalBorderColor = props.borderColor || get(defaultStyleValues, `${props.buttonStyle}.borderColor`) || 'transparent';
  const finalBorderHoverColor = props.borderHoverColor || get(defaultStyleValues, `${props.buttonStyle}.borderHoverColor`) || darken(0.2, finalBorderColor);
  const finalBoxShadow = props.boxShadow || get(defaultStyleValues, `${props.buttonStyle}.boxShadow`) || 'none';
  const finalBoxShadowHover = props.boxShadowHover || get(defaultStyleValues, `${props.buttonStyle}.boxShadowHover`) || 'none';
  const finalBorderRadius = props.borderRadius || get(defaultStyleValues, `${props.buttonStyle}.borderRadius`) || props.theme.borderRadius;

  return `
    border-radius: ${finalBorderRadius};

    &:not(.disabled) {
      background: ${finalBgColor};
      border-color: ${finalBorderColor};
      box-shadow: ${finalBoxShadow};

      ${ButtonText} {
        color: ${finalTextColor};
      }

      ${StyledIcon} {
        fill: ${finalIconColor};
      }

      &:not(.processing):hover,
      &:not(.processing):focus {
        background: ${finalBgHoverColor};
        border-color: ${finalBorderHoverColor};
        box-shadow: ${finalBoxShadowHover};

        ${ButtonText} {
          color: ${finalTextHoverColor};
        }

        ${StyledIcon} {
          fill: ${finalIconHoverColor};
        }
      }
    }

    &.disabled {
      background: ${colors.disabledPrimaryButtonBg};

      ${ButtonText} {
        color: #fff;
      }

      ${StyledIcon} {
        fill: #fff;
      }
    }
  `;
}

const StyledButton = styled.button``;
const StyledLink = styled(Link)``;
const StyledA = styled.a``;
const StyledIcon = styled(Icon)`
  transition: all 100ms ease-out;

  &.hasText.left {
    margin-right: 10px;
  }

  &.hasText.right {
    margin-left: 10px;
  }
`;

const ButtonText = styled.div`
  margin: 0;
  margin-top: -1px;
  padding: 0;
  text-align: left;
  transition: all 100ms ease-out;
`;

const Container = styled.div<ButtonContainerProps>`
  align-items: center;
  display: flex;
  font-weight: 400;
  justify-content: ${(props) => props.justifyWrapper || 'center'};
  margin: 0;
  padding: 0;
  user-select: none;

  * {
    user-select: none;
  }

  &.fullWidth {
    width: 100%;

    button,
    a {
      flex: 1;
      width: 100%;
    }
  }

  button,
  a {
    align-items: center;
    border: ${(props) => props.borderThickness || '1px'} solid transparent;
    display: ${(props) => !props.width ? 'inline-flex' : 'flex'};
    height: ${(props) => props.height || 'auto'};
    justify-content: ${(props) => props.justify || 'center'};
    margin: 0;
    padding: ${(props) => props.padding || getPadding(props.size)};
    position: relative;
    min-width: ${(props) => props.minWidth || 'auto'};
    width: ${(props) => props.width || '100%'};
    transition: background 100ms ease-out,
                border-color 100ms ease-out,
                box-shadow 100ms ease-out;

    &:not(.disabled) {
      cursor: pointer;
    }

    ${ButtonText} {
      opacity: ${(props) => props.processing ? 0 : 1};
      font-size: ${(props) => props.fontSize ? props.fontSize : getFontSize(props.size)};
      line-height: ${(props) => getLineHeight(props.size)};
      font-weight: ${(props) => props.fontWeight || 'normal'}
    }

    ${StyledIcon} {
      flex: 0 0 ${(props) => props.iconSize ? props.iconSize : getIconHeight(props.size)};
      height: ${(props) => props.iconSize ? props.iconSize : getIconHeight(props.size)};
      width: ${(props) => props.iconSize ? props.iconSize : getIconHeight(props.size)};
      opacity: ${(props) => props.processing ? 0 : 1};
    }

    ${(props) => getButtonStyle(props)}
  }

  button.disabled {
    cursor: not-allowed;
  }

  a.disabled {
    pointer-events: none;
  }
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HiddenText = styled.span`
  ${invisibleA11yText()}
`;

export interface ButtonContainerProps {
  buttonStyle?: ButtonStyles;
  style?: ButtonStyles;
  id?: string;
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
  bgColor?: string;
  bgHoverColor?: string;
  borderColor?: string;
  borderHoverColor?: string;
  borderThickness?: string;
  boxShadow?: string;
  boxShadowHover?: string;
  borderRadius?: string;
  fontWeight?: string;
  minWidth?: string;
  fontSize?: string;
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

type State = {};

class Button extends PureComponent<Props, State> {

  handleOnClick = (event) => {
    const { onClick, processing, disabled } = this.props;

    if (onClick) {
      event.preventDefault();
      event.stopPropagation();

      if (!disabled && !processing) {
        onClick(event);
      }
    }
  }

  removeFocus = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }

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
  }

  getSpinnerColor = (style: ButtonStyles) => {
    if (style === 'primary-outlined' || style === 'secondary-outlined') {
      const theme = this.props.theme as object;
      return theme['colorMain'];
    }

    if (style === 'secondary') {
      const theme = this.props.theme as object;
      return theme['colors']['label'];
    }

    return '#fff';
  }

  render() {
    const {
      type,
      text,
      form,
      iconColor,
      iconHoverColor,
      textColor,
      textHoverColor,
      bgColor,
      bgHoverColor,
      borderColor,
      borderHoverColor,
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
      fullWidth,
      ariaLabel,
      fontSize,
      autoFocus,
      ariaExpanded,
      ariaDescribedby,
      iconAriaHidden,
      ariaDisabled
    } = this.props;
    let { id, size, style, processing, disabled, iconPos, className } = this.props;

    id = (id || '');
    size = (size || '1');
    style = (style || 'primary');
    processing = (isBoolean(processing) ? processing : false);
    disabled = (isBoolean(disabled) ? disabled : false);
    iconPos = (iconPos || 'left');
    className = `${className ? className : ''}`;

    const spinnerSize = this.getSpinnerSize(size);
    const spinnerColor = this.props.spinnerColor || textColor || this.getSpinnerColor(style);
    const buttonClassnames = `Button button ${disabled ? 'disabled' : ''} ${processing ? 'processing' : ''} ${fullWidth ? 'fullWidth' : ''} ${style}`;
    const hasText = (!isNil(text) || !isNil(children));
    const childContent = (
      <>
        {icon && iconPos === 'left' &&
          <StyledIcon
            name={icon}
            className={`buttonIcon ${iconPos} ${hasText && 'hasText'}`}
            title={iconTitle}
            colorTheme={iconTheme}
            ariaHidden={iconAriaHidden}
          />}
        {hasText && <ButtonText className="buttonText">{text || children}</ButtonText>}
        {hiddenText && <HiddenText>{hiddenText}</HiddenText>}
        {icon && iconPos === 'right' &&
          <StyledIcon
            name={icon}
            className={`buttonIcon ${iconPos} ${hasText && 'hasText'}`}
            title={iconTitle}
            colorTheme={iconTheme}
            ariaHidden={iconAriaHidden}
          />
        }
        {processing &&
          <SpinnerWrapper>
            <Spinner size={spinnerSize} color={spinnerColor} />
          </SpinnerWrapper>
        }
      </>
    );

    return (
      <Container
        className={`${className} ${buttonClassnames}`}
        onClick={this.handleOnClick}
        onMouseDown={this.removeFocus}
        buttonStyle={style}
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
        bgColor={bgColor}
        bgHoverColor={bgHoverColor}
        borderColor={borderColor}
        borderHoverColor={borderHoverColor}
        borderThickness={borderThickness}
        boxShadow={boxShadow}
        boxShadowHover={boxShadowHover}
        borderRadius={borderRadius}
        fontWeight={fontWeight}
        minWidth={minWidth}
        fontSize={fontSize}
      >
        {linkTo && !disabled ? (
          (isString(linkTo) && linkTo.startsWith('http')) ? (
            <StyledA
              ref={this.props.setSubmitButtonRef}
              href={linkTo}
              target={openInNewTab ? '_blank' : '_self'}
              className={buttonClassnames}
              aria-label={ariaLabel}
            >
              {childContent}
            </StyledA>
          ) : (
            <StyledLink
              ref={this.props.setSubmitButtonRef}
              to={linkTo}
              className={buttonClassnames}
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
            className={buttonClassnames}
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
