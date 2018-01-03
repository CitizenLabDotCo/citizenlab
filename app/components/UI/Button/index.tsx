import * as React from 'react';
import * as _ from 'lodash';
import { darken, rgba } from 'polished';
import { ITheme } from 'typings';
import Spinner from 'components/UI/Spinner';
import Icon, { IconNames } from 'components/UI/Icon';
import { Link } from 'react-router';
import styled, { css } from 'styled-components';

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

function getPadding(size) {
  switch (size) {
    case '2':
      return `10px 22px`;
    case '3':
      return `12px 26px`;
    case '4':
      return `14px 28px`;
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

  ${StyledButton},
  ${StyledLink},
  ${StyledA} {
    width: ${(props: any) => props.width || 'auto'};
    height: ${(props: any) => props.height || 'auto'};
    display: ${(props: any) => !props.width ? 'inline-flex' : 'flex'};
    align-items: center;
    justify-content: ${(props: any) => props.justify || 'center'};
    margin: 0;
    padding: ${(props: any) => getPadding(props.size)};
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
      font-size: 16px;
      line-height: 20px;
    }

    ${StyledIcon} {
      height: ${(props: any) => getIconHeight(props.size)};
      opacity: ${(props: any) => props.processing ? 0 : 1};
    }

    &.primary {
      &:not(.disabled) {
        ${setFillColor('#fff')}
        background: ${(props: any) => props.theme.colorMain || '#e0e0e0'};

        &:not(.processing):hover,
        &:not(.processing):focus {
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
        border-color: #EAEAEA;
        background: #F8F8F8;
        ${setFillColor('#84939E')}

        &:not(.processing):hover,
        &:not(.processing):focus {
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

        &:not(.processing):hover,
        &:not(.processing):focus {
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
        background: transparent;
        border: solid 1px #999;
        ${setFillColor('#999')}

        &:not(.processing):hover,
        &:not(.processing):focus {
          border-color: #222;
          ${setFillColor('#444')}
        }
      }

      &.disabled {
        background: transparent;
        border: solid 1px #ccc;
        ${setFillColor('#ccc')}
      }
    }

    &.text {
      border: none;
      background: none;

      ${setFillColor('#84939E')}

      &:not(.processing):hover,
      &:not(.processing):focus {
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
      background-color: #01A1B1;
      ${setFillColor('white')}

      &:not(.processing):hover,
      &:not(.processing):focus {
        background-color: ${darken(0.12, '#01A1B1')};
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
};

type State = {};

export default class Button extends React.PureComponent<Props, State> {
  handleOnClick = (event: React.FormEvent<HTMLButtonElement>) => {
    if (this.props.onClick && !this.props.disabled && !this.props.processing) {
      event.preventDefault();
      this.props.onClick(event);
    }
  }

  render() {
    const { text, width, height, padding, justify, icon, children, linkTo } = this.props;
    let { id, size, style, processing, disabled, fullWidth, circularCorners, className } = this.props;

    id = (id || '');
    size = (size || '1');
    style = (style || 'primary');
    processing = (_.isBoolean(processing) ? processing : false);
    disabled = (_.isBoolean(disabled) ? disabled : false);
    fullWidth = (_.isBoolean(fullWidth) ? fullWidth : false);
    circularCorners = (_.isBoolean(circularCorners) ? circularCorners : true);
    className = `${className ? className : ''}`;

    const buttonClassnames = `Button ${disabled ? 'disabled' : ''} ${processing ? 'processing' : ''} ${fullWidth ? 'fullWidth' : ''} ${style}`;

    const childContent = (
      <ButtonContent>
        {icon && <StyledIcon name={icon} />}
        <ButtonText>{text || children}</ButtonText>
        {processing && <SpinnerWrapper><Spinner size="24px" /></SpinnerWrapper>}
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
        className={className}
      >
        {button}
      </Container>
    );
  }
}
