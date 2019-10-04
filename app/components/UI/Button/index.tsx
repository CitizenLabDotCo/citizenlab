import React, { PureComponent, FormEvent, ButtonHTMLAttributes } from 'react';
import Link from 'utils/cl-router/Link';
import { isBoolean, isNil } from 'lodash-es';
import styled, { withTheme } from 'styled-components';
import { darken, readableColor } from 'polished';
import { colors, invisibleA11yText, fontSizes } from 'utils/styleUtils';
import Spinner from 'components/UI/Spinner';
import Icon, { Props as IconProps, clColorTheme } from 'components/UI/Icon';

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

function setFillColor(color) {
  return `
    ${ButtonText} {
      color: ${color};
    }

    ${StyledIcon} {
      fill: ${color};
    }
  `;
}

// Sets the button colors depending on Background color, optionally set the text/icon fill color and border color.
function buttonTheme(
  props: Props,
  bgColor: string,
  textColor: string,
  borderColor = 'transparent',
  bgHoverColor?: string | null,
  textHoverColor?: string | null,
  borderHoverColor?: string | null
) {
  const finalBgColor = props.bgColor || bgColor;
  const finalBgHoverColor = props.bgHoverColor || bgHoverColor;
  const finalTextColor = props.textColor || textColor;
  const finalTextHoverColor = props.textHoverColor || textHoverColor;
  const finalBorderColor = props.borderColor || borderColor;
  const finalBorderHoverColor = props.borderHoverColor || borderHoverColor;

  return `
    &:not(.disabled) {
      ${setFillColor(finalTextColor || readableColor(finalBgColor))}
      background: ${finalBgColor};
      border-color: ${finalBorderColor};

      &:not(.processing):hover,
      &:not(.processing):focus {
        ${finalBgColor !== ('transparent' || '#fff' || 'white')
          && `background: ${finalBgHoverColor || darken(0.12, finalBgColor)};`}

        ${finalBgColor === ('transparent' || '#fff' || 'white')
          && finalTextColor && (finalTextHoverColor || setFillColor(darken(0.2, finalTextColor)))}

        ${finalBgColor === ('transparent' || '#fff' || 'white')
          && finalBorderColor !== 'transparent'
          && `border-color: ${finalBorderHoverColor || darken(0.2, finalBorderColor)};`}
      }
    }

    &.disabled {
      background: ${colors.disabledPrimaryButtonBg};
      ${setFillColor('#fff')}
    }
  `;
}

const StyledButton = styled.button``;
const StyledLink = styled(Link)``;
const StyledA = styled.a``;
const StyledIcon = styled(Icon)`
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
  white-space: nowrap;
`;

const Container: any = styled.div`
  align-items: center;
  display: flex;
  font-weight: 400;
  justify-content: ${(props: any) => props.justifyWrapper || 'center'};
  margin: 0;
  padding: 0;
  user-select: none;
  * {
    user-select: none;
  }
  &.fullWidth {
    width: 100%;
  }
  button,
  a {
    align-items: center;
    border: ${(props: any) => props.borderThickness || '1px'} solid transparent;
    border-radius: ${(props: any) => props.theme.borderRadius};
    display: ${(props: any) => !props.width ? 'inline-flex' : 'flex'};
    height: ${(props: any) => props.height || 'auto'};
    justify-content: ${(props: any) => props.justify || 'center'};
    margin: 0;
    padding: ${(props: any) => props.padding || getPadding(props.size)};
    position: relative;
    transition: all 100ms ease-out;
    min-width: ${(props: any) => props.minWidth || 'auto'};
    width: ${(props: any) => props.width || '100%'};
    outline: none;
    &:not(.disabled) {
      cursor: pointer;
    }
    &.fullWidth {
      width: 100%;
      flex: 1;
    }
    ${ButtonText} {
      opacity: ${(props: any) => props.processing ? 0 : 1};
      font-size: ${(props: any) => props.fontSize ? props.fontSize : getFontSize(props.size)};
      line-height: ${(props: any) => getLineHeight(props.size)};
      font-weight: ${(props: any) => props.fontWeight || 'normal'}
    }
    ${StyledIcon} {
      flex: 0 0 ${(props: any) => props.iconSize ? props.iconSize : getIconHeight(props.size)};
      height: ${(props: any) => props.iconSize ? props.iconSize : getIconHeight(props.size)};
      width: ${(props: any) => props.iconSize ? props.iconSize : getIconHeight(props.size)};
      opacity: ${(props: any) => props.processing ? 0 : 1};
    }
    &.primary {
      ${(props: any) => buttonTheme(props, props.theme.colorMain || 'e0e0e0', '#fff')}
    }
    &.primary-inverse {
      ${(props: any) => buttonTheme(props, '#fff', props.theme.colorMain || 'e0e0e0')}
    }
    &.secondary {
      ${(props: any) => buttonTheme(
        props,
        colors.lightGreyishBlue,
        darken(0.1, colors.label),
        'transparent',
        darken(0.05, colors.lightGreyishBlue)
      )}
    }
    &.primary-outlined {
      ${(props: any) => buttonTheme(props, 'transparent', props.theme.colorMain
        || 'e0e0e0', props.theme.colorMain || 'e0e0e0')}
    }
    &.secondary-outlined {
      ${(props: any) => buttonTheme(props, 'transparent', colors.label, colors.label)}
    }
    &.text {
      ${(props: any) => buttonTheme(props, 'transparent', colors.label)}
    }
    &.success {
      ${(props: any) => buttonTheme(props, colors.clGreenSuccessBackground, colors.clGreenSuccess)}
    }
    &.cl-blue {
      ${(props: any) => buttonTheme(props, colors.clBlueDark, 'white')}
    }
    &.admin-dark {
      ${(props: any) => buttonTheme(props, colors.adminTextColor, 'white')}
    }
    &.delete {
      ${(props: any) => buttonTheme(props, colors.clRedError, 'white')}
    }
  }
  button.disabled {
    cursor: not-allowed;
  }
  a.disabled {
    pointer-events: none;
  }
  &.bannerStyle {
    height: 100%;

    .Button {
      display: flex;
      align-items: center;
      height: 100%;
      border-radius: 0;
    }

    .buttonText {
      display: inline-flex;
      align-items: center;
    }
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

export type Props = {
  children?: any;
  className?: string;
  disabled?: boolean;
  form?: string;
  fullWidth?: boolean;
  height?: string;
  hiddenText?: string | JSX.Element;
  icon?: IconProps['name'];
  iconPos?: 'left' | 'right';
  iconSize?: string;
  iconTitle?: IconProps['title'];
  iconTheme?: clColorTheme;
  id?: string;
  justify?: 'left' | 'center' | 'right' | 'space-between';
  justifyWrapper?: 'left' | 'center' | 'right' | 'space-between';
  linkTo?: string;
  openInNewTab?: boolean;
  onClick?: (arg: FormEvent<HTMLButtonElement>) => void;
  padding?: string;
  processing?: boolean;
  setSubmitButtonRef?: (value: any) => void;
  size?: '1' | '2' | '3' | '4';
  style?: ButtonStyles;
  text?: string | JSX.Element;
  textColor?: string;
  textHoverColor?: string;
  bgColor?: string;
  bgHoverColor?: string;
  borderColor?: string;
  borderHoverColor?: string;
  borderThickness?: string;
  fontWeight?: string;
  theme?: object | undefined;
  minWidth?: string;
  width?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  spinnerColor?: string;
  fullHeight?: boolean;
  ariaLabel?: string;
  fontSize?: string;
  autoFocus?: boolean;
  iconAriaHidden?: boolean;
};

type State = {};

class Button extends PureComponent<Props, State> {

  handleOnClick = (event: FormEvent<HTMLButtonElement>) => {
    const { onClick, processing, disabled } = this.props;
    if (onClick) {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled && !processing) {
        onClick(event);
      }
    }
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
      textColor,
      textHoverColor,
      bgColor,
      bgHoverColor,
      borderColor,
      borderHoverColor,
      borderThickness,
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
      fullHeight,
      ariaLabel,
      fontSize,
      autoFocus,
      iconAriaHidden
    } = this.props;
    let { id, size, style, processing, disabled, fullWidth, iconPos, className } = this.props;

    id = (id || '');
    size = (size || '1');
    style = (style || 'primary');
    processing = (isBoolean(processing) ? processing : false);
    disabled = (isBoolean(disabled) ? disabled : false);
    fullWidth = (isBoolean(fullWidth) ? fullWidth : false);
    iconPos = (iconPos || 'left');
    className = `${className ? className : ''}`;

    const spinnerSize = this.getSpinnerSize(size);
    const spinnerColor = this.props.spinnerColor || this.getSpinnerColor(style);
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
        />}
        {processing &&
          <SpinnerWrapper>
            <Spinner size={spinnerSize} color={spinnerColor} />
          </SpinnerWrapper>
        }
      </>
    );

    return (
      <Container
        id={id}
        size={size}
        width={width}
        height={height}
        padding={padding}
        justify={justify}
        justifyWrapper={justifyWrapper}
        iconSize={iconSize}
        processing={processing}
        onClick={this.handleOnClick}
        disabled={disabled}
        className={`${className} ${buttonClassnames} ${fullHeight ? 'bannerStyle' : ''}`}
        textColor={textColor}
        textHoverColor={textHoverColor}
        bgColor={bgColor}
        bgHoverColor={bgHoverColor}
        borderColor={borderColor}
        borderHoverColor={borderHoverColor}
        borderThickness={borderThickness}
        fontWeight={fontWeight}
        minWidth={minWidth}
        fontSize={fontSize}
      >
        {linkTo ? (
          (typeof (linkTo === 'string') && (linkTo as string).startsWith('http')) ? (
            <StyledA
              ref={this.props.setSubmitButtonRef}
              href={(linkTo as string)}
              target={openInNewTab ? '_blank' : '_self'}
              className={buttonClassnames}
            >
              {childContent}
            </StyledA>
          ) : (
            <StyledLink
              ref={this.props.setSubmitButtonRef}
              to={linkTo}
              className={buttonClassnames}
            >
              {childContent}
            </StyledLink>
          )
        ) : (
          <StyledButton
            aria-label={ariaLabel}
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
