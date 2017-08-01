import * as React from 'react';
import * as _ from 'lodash';
import { darken, lighten } from 'polished';
import { ITheme } from 'typings';
import Spinner from 'components/UI/Spinner';
import Icon from 'components/UI/Icon';
import styled from 'styled-components';

const ButtonText = styled.div`
  color: #fff;
  font-weight: 400;
`;

const IconWrapper = styled.div`
  height: 22px;
  margin-right: 10px;

  svg {
    fill: #000;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledButton: any = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  position: relative;
  outline: none;
  transition: background 150ms ease;

  &:not(.disabled) {
    cursor: pointer;
  }

  &.disabled {
    cursor: not-allowed;
  }

  &.primary {
    &:not(.disabled) {
      background: ${(props: any) => props.theme.color.main || '#e0e0e0'};

      ${ButtonText} {
        color: ${(props: any) => '#fff' || '#000'};
      }

      &{IconWrapper} svg {
        fill: ${(props: any) => '#fff' || '#000'};
      }

      &:hover {
        background: ${(props: any) => darken(0.1, (props.theme.color.main || '#ccc'))};
      }
    }

    &.disabled {
      background: #d0d0d0;

      ${ButtonText} {
        color: #fff;
      }

      &{IconWrapper} svg {
        fill: #fff;
      }
    }
  }

  &.secondary {
    &:not(.disabled) {
      background: #eae9e9;

      ${ButtonText} {
        color: #676767;
      }

      &{IconWrapper} svg {
        fill: #676767;
      }

      &:hover {
        background: ${(props: any) => darken(0.1, '#eae9e9')};
      }
    }

    &.disabled {
      background: #ccc;

      ${ButtonText} {
        color: #fff;
      }

      &{IconWrapper} svg {
        fill: #fff;
      }
    }
  }

  ${ButtonContent} {
    padding: ${(props: any) => {
      switch (props.size) {
        case '2':
          return '9px 15px';
        case '3':
          return '11px 16px';
        case '4':
          return '12px 17px';
        default:
          return '9px 14px';
      }
    }};

    ${ButtonText} {
      white-space: nowrap;
      font-size: ${(props: any) => {
        switch (props.size) {
          case '2':
            return '17px';
          case '3':
            return '18px';
          case '4':
            return '19px';
          default:
            return '16px';
        }
      }};
      opacity: ${(props: any) => props.loading ? 0 : 1}
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
  text: string;
  children?: any;
  size?: string;
  style?: 'primary' | 'secondary';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: (arg: React.FormEvent<HTMLButtonElement>) => void;
  className?: string;
};

type State = {};

export default class Button extends React.PureComponent<Props, State> {
  handleOnClick = (event: React.FormEvent<HTMLButtonElement>) => {
    if (!this.props.disabled) {
      this.props.onClick(event);
    }
  }

  render() {
    const { text, className, icon, children } = this.props;
    let { size, style, loading, disabled } = this.props;

    size = (size || '2');
    style = (style || 'primary');
    loading = (_.isBoolean(loading) ? loading : false);
    disabled = (_.isBoolean(disabled) ? disabled : false);

    return (
      <StyledButton
        size={size}
        loading={loading}
        onClick={this.handleOnClick}
        disabled={disabled}
        className={`Button ${disabled && 'disabled'} ${style} ${className}`}
      >
        <ButtonContent>
          {icon && <IconWrapper><Icon name={icon} /></IconWrapper>}
          <ButtonText>{text || children}</ButtonText>
          {loading && <SpinnerWrapper><Spinner /></SpinnerWrapper>}
        </ButtonContent>
      </StyledButton>
    );
  }
}
