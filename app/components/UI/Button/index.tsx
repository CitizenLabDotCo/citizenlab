import * as React from 'react';
import * as _ from 'lodash';
import { darken, rgba } from 'polished';
import { ITheme } from 'typings';
import Spinner from 'components/UI/Spinner';
import Icon from 'components/UI/Icon';
import { Link } from 'react-router';
import styled, { css } from 'styled-components';

const ButtonText = styled.div`
  color: #fff;
  font-weight: 400;
  margin: 0;
  margin-top: -1px;
  padding: 0;
  white-space: nowrap;
`;

const StyledIcon = styled(Icon)`
  fill: #fff;
  margin-right: 14px;
  transition: all 120ms ease;
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  transition: all 120ms ease;
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
    .button-text {
      color: ${color};
    }

    .button-icon {
      fill: ${color};
    }
  `;
}

const buttonStyles = (props) => `
  width: ${props.width || 'auto'};
  height: ${props.height || 'auto'};
  display: ${!props.width ? 'inline-flex' : 'flex'};
  font-size: 1.25rem;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: ${getPadding(props.size)};
  border-radius: ${props.circularCorners ? '999em' : '5px'};
  position: relative;
  outline: none;
  transition: all 120ms ease;

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

  .button-text {
    opacity: ${(props: any) => props.loading ? 0 : 1};
    font-size: 16px;
    line-height: 20px;
  }

  .button-icon {
    height: ${getIconHeight(props.size)};
  }

  &.primary {
    &:not(.disabled) {
      ${setFillColor('#fff')}
      background: ${props.theme.colorMain || '#e0e0e0'};


      &:hover,
      &:focus {
        background: ${darken(0.15, (props.theme.colorMain || '#ccc'))};
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

      &:hover,
      &:focus {
        background: #F9F9F9;
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
      border: solid 1px ${props.theme.colorMain};
      ${setFillColor(props.theme.colorMain)}

      &:hover,
      &:focus {
        border-color: ${darken(0.15, (props.theme.colorMain))};
        ${setFillColor(darken(0.15, (props.theme.colorMain)))}
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

      &:hover,
      &:focus {
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

    &:hover,
    &:focus {
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

    &:hover,
    &:focus {
      background-color: ${darken(0.15, '#01A1B1')};
    }

    &.disabled {
      background: #d0d0d0;
      ${setFillColor('#fff')}
    }
  }

`;

const StyledButton: any = styled.button`
  ${buttonStyles}
`;

const StyledLink: any = styled(Link)`
  ${buttonStyles}
`;

const SpinnerWrapper = styled.div`
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export type ButtonStyles = 'primary' | 'primary-outlined' | 'secondary' | 'secondary-outlined' | 'success' | 'error' | 'text' | 'cl-blue';

type Props = {
  text?: string;
  children?: any;
  size?: '1' | '2' | '3' | '4';
  style?: ButtonStyles;
  width?: string | undefined;
  height?: string | undefined;
  padding?: string | undefined;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: (arg: React.FormEvent<HTMLButtonElement>) => void;
  className?: string;
  circularCorners?: boolean;
  linkTo?: string;
};

type State = {};

export default class Button extends React.PureComponent<Props, State> {
  handleOnClick = (event: React.FormEvent<HTMLButtonElement>) => {
    if (_.has(this.props, 'onClick') && _.isFunction(this.props.onClick) && !this.props.disabled) {
      this.props.onClick(event);
    }
  }

  render() {
    const { text, width, height, padding, className, icon, children, linkTo } = this.props;
    let { size, style, loading, disabled, fullWidth, circularCorners } = this.props;

    size = (size || '1');
    style = (style || 'primary');
    loading = (_.isBoolean(loading) ? loading : false);
    disabled = (_.isBoolean(disabled) ? disabled : false);
    fullWidth = (_.isBoolean(fullWidth) ? fullWidth : false);
    circularCorners = (_.isBoolean(circularCorners) ? circularCorners : true);

    const StyledComponent = linkTo ? StyledLink : StyledButton;

    return (
      <StyledComponent
        to={linkTo}
        size={size}
        width={width}
        height={height}
        padding={padding}
        loading={loading}
        onClick={this.handleOnClick}
        disabled={disabled}
        circularCorners={circularCorners}
        className={`Button ${disabled ? 'disabled' : ''} ${fullWidth ? 'fullWidth' : ''} ${style} ${className ? className : ''}`}
      >
        <ButtonContent className="button-content">
          {icon && <StyledIcon className="button-icon" name={icon} />}
          <ButtonText className="button-text">{text || children}</ButtonText>
          {loading && <SpinnerWrapper><Spinner /></SpinnerWrapper>}
        </ButtonContent>
      </StyledComponent>
    );
  }
}
