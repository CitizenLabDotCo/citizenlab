import * as React from 'react';
import { isBoolean } from 'lodash';
import { darken, rgba } from 'polished';
import Spinner from 'components/UI/Spinner';
import Icon, { IconNames } from 'components/UI/Icon';
import { Link } from 'react-router';
import styled, { withTheme } from 'styled-components';

const StyledButton = styled.button``;

const StyledLink = styled(Link)``;

const StyledA = styled.a``;

const ButtonText = styled.div`
  margin: 0;
  margin-top: -1px;
  padding: 0;
  white-space: nowrap;
`;

const StyledIcon = styled(Icon)`
  margin-right: 14px;
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
`;

function getFontSize(size) {
  switch (size) {
    case '2':
      return `18px`;
    case '3':
      return `20px`;
    case '4':
      return `22px`;
    default:
      return `16px`;
  }
}

function getPadding(size) {
  switch (size) {
    case '2':
      return `11px 22px`;
    case '3':
      return `13px 24px`;
    case '4':
      return `15px 26px`;
    default:
      return `9px 20px`;
  }
}

function getIconHeight(size) {
  switch (size) {
    case '2':
      return `20px`;
    case '3':
      return `22px`;
    case '4':
      return `24px`;
    default:
      return `18px`;
  }
}

function getLineHeight(size) {
  switch (size) {
    case '2':
      return `24px`;
    case '3':
      return `26px`;
    case '4':
      return `28px`;
    default:
      return `22px`;
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

const Container: any = styled.div`
  user-select: none;
  font-weight: 400;

  * {
    user-select: none;
  }

  &.fullWidth {
    width: 100%;
  }

  ${StyledButton},
  ${StyledLink},
  ${StyledA} {
    width: ${(props: any) => props.width || 'auto'};
    height: ${(props: any) => props.height || 'auto'};
    display: ${(props: any) => !props.width ? 'inline-flex' : 'flex'};
    align-items: center;
    justify-content: ${(props: any) => props.justify || 'center'};
    margin: 0;
    padding: ${(props: any) => props.padding || getPadding(props.size)};
    border-radius: ${(props: any) => props.circularCorners ? '999em' : '5px'};
    position: relative;
    outline: none;
    transition: all 120ms ease-out;

    &:not(.disabled) {
      cursor: pointer;
    }

    &.disabled {
      cursor: not-allowed;
    }

    &.fullWidth {
      width: 100%;
      flex: 1;
    }

    ${ButtonText} {
      opacity: ${(props: any) => props.processing ? 0 : 1};
      font-size: ${(props: any) => getFontSize(props.size)};
      line-height: ${(props: any) => getLineHeight(props.size)};
    }

    ${StyledIcon} {
      height: ${(props: any) => getIconHeight(props.size)};
      opacity: ${(props: any) => props.processing ? 0 : 1};
    }

    &.primary {
      &:not(.disabled) {
        ${setFillColor('#fff')}
        background: ${(props: any) => props.theme.colorMain || '#e0e0e0'};

        &:not(.processing):hover {
          background: ${(props: any) => darken(0.12, (props.theme.colorMain || '#ccc'))};
        }
      }

      &.disabled {
        background: #d0d0d0;
        ${setFillColor('#fff')}
      }
    }

    &.secondary {
      &:not(.disabled) {
        border-color: #eaeaea;
        background: #f9f9fa;
        ${setFillColor('#84939E')}

        &:not(.processing):hover {
          background: #eee;
          ${setFillColor('#222')}
        }
      }

      &.disabled {
        background: #ccc;
        ${setFillColor('#fff')}
      }
    }

    &.primary-outlined {
      &:not(.disabled) {
        background: transparent;
        border: solid 1px ${(props: any) => props.theme.colorMain};
        ${(props: any) => setFillColor(props.theme.colorMain)}

        &:not(.processing):hover {
          border-color: ${(props: any) => darken(0.12, (props.theme.colorMain))};
          ${(props: any) => setFillColor(darken(0.12, (props.theme.colorMain)))}
        }
      }

      &.disabled {
        background: transparent;
        border: solid 1px #ccc;
        ${setFillColor('#ccc')}
      }
    }

    &.secondary-outlined {
      &:not(.disabled) {
        background: #fff;
        border: solid 1px #e0e0e0;
        ${(props: any) => setFillColor(props.theme.colorMain)}

        &:not(.processing):hover {
          border-color: #999;
          ${(props: any) => setFillColor(darken(0.15, (props.theme.colorMain)))}
        }
      }

      &.disabled {
        background: #fff;
        border-color: #f0f0f0;
        ${setFillColor('#ccc')}
      }
    }

    &.text {
      border: none;
      background: none;

      ${setFillColor('#84939E')}

      &:not(.processing):hover {
        ${setFillColor('#004949')}
      }
    }

    &.success {
      background-color: ${rgba('#32B67A', 0.15)};
      ${setFillColor('#32B67A')}
    }

    &.error {
      background-color: ${rgba('#FC3C2D', 0.15)};
      color: #FC3C2D;
      ${setFillColor('#FC3C2D')}
    }

    &.cl-blue {
      &:not(.disabled) {
        background-color: #01A1B1;
        ${setFillColor('white')}

        &:not(.processing):hover {
          background-color: ${darken(0.12, '#01A1B1')};
      }
      }

      &.disabled {
        background: #d0d0d0;
        ${setFillColor('#fff')}
      }
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

export type ButtonStyles = 'primary' | 'primary-outlined' | 'secondary' | 'secondary-outlined' | 'success' | 'error' | 'text' | 'cl-blue';

type Props = {
  text?: string | JSX.Element;
  children?: any;
  size?: '1' | '2' | '3' | '4';
  style?: ButtonStyles;
  width?: string | undefined;
  height?: string | undefined;
  padding?: string | undefined;
  justify?: 'left' | 'center' | 'right' | undefined;
  icon?: IconNames;
  processing?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: (arg: React.FormEvent<HTMLButtonElement>) => void;
  className?: string;
  circularCorners?: boolean;
  linkTo?: string;
  id?: string;
  theme?: object | undefined;
};

type State = {};

class Button extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
  }

  handleOnClick = (event: React.FormEvent<HTMLButtonElement>) => {
    if (this.props.onClick && !this.props.disabled && !this.props.processing) {
      event.preventDefault();
      this.props.onClick(event);
    }
  }

  getSpinnerSize = (size) => {
    switch (size) {
      case '2':
        return `26px`;
      case '3':
        return `28px`;
      case '4':
        return `30px`;
      default:
        return `24px`;
    }
  }

  getSpinnerColor = (style: ButtonStyles) => {
    if (style === 'primary-outlined' || style === 'secondary-outlined') {
      const theme = this.props.theme as object;
      return theme['colorMain'];
    }

    return '#fff';
  }

  render() {
    const { text, width, height, padding, justify, icon, children, linkTo } = this.props;
    let { id, size, style, processing, disabled, fullWidth, circularCorners, className } = this.props;

    id = (id || '');
    size = (size || '1');
    style = (style || 'primary');
    processing = (isBoolean(processing) ? processing : false);
    disabled = (isBoolean(disabled) ? disabled : false);
    fullWidth = (isBoolean(fullWidth) ? fullWidth : false);
    circularCorners = (isBoolean(circularCorners) ? circularCorners : true);
    className = `${className ? className : ''}`;
    const spinnerSize = this.getSpinnerSize(size);
    const spinnerColor = this.getSpinnerColor(style);

    const buttonClassnames = `Button ${disabled ? 'disabled' : ''} ${processing ? 'processing' : ''} ${fullWidth ? 'fullWidth' : ''} ${style}`;

    const childContent = (
      <ButtonContent>
        {icon && <StyledIcon name={icon} />}
        <ButtonText>{text || children}</ButtonText>
        {processing && <SpinnerWrapper><Spinner size={spinnerSize} color={spinnerColor} /></SpinnerWrapper>}
      </ButtonContent>
    );

    let button = <StyledButton className={buttonClassnames}>{childContent}</StyledButton>;

    if (linkTo) {
      if (linkTo.startsWith('http://') || linkTo.startsWith('https://')) {
        button = <StyledA href={linkTo} className={buttonClassnames}>{childContent}</StyledA>;
      } else {
        button = <StyledLink to={linkTo} className={buttonClassnames}>{childContent}</StyledLink>;
      }
    }

    return (
      <Container
        id={id}
        size={size}
        width={width}
        height={height}
        padding={padding}
        justify={justify}
        processing={processing}
        onClick={this.handleOnClick}
        disabled={disabled}
        circularCorners={circularCorners}
        className={`${className} ${buttonClassnames}`}
      >
        {button}
      </Container>
    );
  }
}

export default withTheme(Button);
