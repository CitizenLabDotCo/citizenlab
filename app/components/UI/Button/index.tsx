import * as React from 'react';
import * as _ from 'lodash';
import { darken, lighten, rgba } from 'polished';
import { ITheme } from 'typings';
import Spinner from 'components/UI/Spinner';
import Icon from 'components/UI/Icon';
import styled, { css } from 'styled-components';

const ButtonText = styled.div`
  color: #fff;
  font-weight: 400;
  margin: 0;
  padding: 0;
  white-space: nowrap;
`;

const StyledIcon = styled(Icon) `
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

const StyledButton: any = styled.button`
  width: ${(props: any) => props.width || 'auto'};
  height: ${(props: any) => props.height || 'auto'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border-radius: ${(props: any) => props.circularCorners ? '999em' : '5px'};
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

  ${ButtonContent} {
    ${(props: any) => {
      if (props.padding) {
        return css`
          padding: ${props.padding};
        `;
      } else if (props.size === '2') {
        return css`
          padding: 10px 15px;
        `;
      } else if (props.size === '3') {
        return css`
          padding: 12px 16px;
        `;
      }

      return css`
        padding: 8px 14px;
      `;
    }}
  }

  ${ButtonText} {
    opacity: ${(props: any) => props.loading ? 0 : 1};

    ${(props: any) => {
      if (props.size === '2') {
        return css`
          font-size: 17px;
          line-height: 17px;
        `;
      } else if (props.size === '3') {
        return css`
          font-size: 18px;
          line-height: 18px;
        `;
      }

      return css`
        font-size: 16px;
        line-height: 16px;
      `;
    }}
  }

  ${StyledIcon} {
    ${(props: any) => {
      if (props.size === '2') {
        return css`
          height: 20px;
        `;
      } else if (props.size === '3') {
        return css`
          height: 22px;
        `;
      }

      return css`
        height: 18px;
      `;
    }}
  }

  &.primary {
    &:not(.disabled) {
      background: ${(props: any) => props.theme.colorMain || '#e0e0e0'};

      ${ButtonText} {
        color: #fff;
      }

      ${StyledIcon} {
        fill: #fff;
      }

      &:hover,
      &:focus {
        background: ${(props: any) => darken(0.15, (props.theme.colorMain || '#ccc'))};
      }
    }

    &.disabled {
      background: #d0d0d0;

      ${ButtonText} {
        color: #fff;
      }

      ${StyledIcon} {
        fill: #fff;
      }
    }
  }

  &.secondary {
    &:not(.disabled) {
      background: #e8e8e8;

      ${ButtonText} {
        color: #444;
      }

      ${StyledIcon} {
        fill: #444;
      }

      &:hover,
      &:focus {
        background: #ddd;

        ${ButtonText} {
          color: #000;
        }
  
        ${StyledIcon} {
          fill: #000;
        }
      }
    }

    &.disabled {
      background: #ccc;

      ${ButtonText} {
        color: #fff;
      }

      ${StyledIcon} {
        fill: #fff;
      }
    }
  }

  &.primary-outlined {
    &:not(.disabled) {
      background: transparent;
      border: solid 1px ${(props: any) => props.theme.colorMain};

      ${ButtonText} {
        color: ${(props: any) => props.theme.colorMain};
      }

      ${StyledIcon} {
        fill: ${(props: any) => props.theme.colorMain};
      }

      &:hover,
      &:focus {
        background: ${(props: any) => props.theme.colorMain};

        ${ButtonText} {
          color: #fff
        }
  
        ${StyledIcon} {
          fill: #fff
        }
      }
    }

    &.disabled {
      background: transparent;
      border: solid 1px #ccc;

      ${ButtonText} {
        color: #ccc;
      }

      ${StyledIcon} {
        fill: #ccc;
      }
    }
  }

  &.secondary-outlined {
    &:not(.disabled) {
      background: transparent;
      border: solid 1px #999;

      ${ButtonText} {
        color: #999;
      }

      ${StyledIcon} {
        fill: #999;
      }

      &:hover,
      &:focus {
        background: ${(props: any) => darken(0.15, '#eae9e9')};
        border-color: ${(props: any) => darken(0.15, '#eae9e9')};

        ${ButtonText} {
          color: #676767;
        }
  
        ${StyledIcon} {
          fill: #676767;
        }
      }
    }

    &.disabled {
      background: transparent;
      border: solid 1px #ccc;

      ${ButtonText} {
        color: #ccc;
      }

      ${StyledIcon} {
        fill: #ccc;
      }
    }
  }

  &.success {
    background-color: ${rgba('#32B67A', 0.15)};
    color: #32B67A;

    ${ButtonText} {
      color: inherit;
    }

    ${StyledIcon} {
      fill: #32B67A;
    }
  }

  &.error {
    background-color: ${rgba('#FC3C2D', .15)};
    color: #FC3C2D;

    ${ButtonText} {
      color: inherit;
    }

    ${StyledIcon} {
      fill: #FC3C2D;
    }
  }
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

type Props = {
  text?: string;
  children?: any;
  size?: '1' | '2' | '3';
  style?: 'primary' | 'primary-outlined' | 'secondary' | 'secondary-outlined' | 'success' | 'error';
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
};

type State = {};

export default class Button extends React.PureComponent<Props, State> {
  handleOnClick = (event: React.FormEvent<HTMLButtonElement>) => {
    if (_.has(this.props, 'onClick') && _.isFunction(this.props.onClick) && !this.props.disabled) {
      this.props.onClick(event);
    }
  }

  render() {
    const { text, width, height, padding, className, icon, children } = this.props;
    let { size, style, loading, disabled, fullWidth, circularCorners } = this.props;

    size = (size || '1');
    style = (style || 'primary');
    loading = (_.isBoolean(loading) ? loading : false);
    disabled = (_.isBoolean(disabled) ? disabled : false);
    fullWidth = (_.isBoolean(fullWidth) ? fullWidth : false);
    circularCorners = (_.isBoolean(circularCorners) ? circularCorners : true);

    return (
      <StyledButton
        size={size}
        width={width}
        height={height}
        padding={padding}
        loading={loading}
        onClick={this.handleOnClick}
        disabled={disabled}
        circularCorners={circularCorners}
        className={`Button ${disabled && 'disabled'} ${fullWidth && 'fullWidth'} ${style} ${className}`}
      >
        <ButtonContent>
          {icon && <StyledIcon name={icon} />}
          <ButtonText>{text || children}</ButtonText>
          {loading && <SpinnerWrapper><Spinner /></SpinnerWrapper>}
        </ButtonContent>
      </StyledButton>
    );
  }
}
