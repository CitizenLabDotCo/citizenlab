import * as React from 'react';
import { darken } from 'polished';
import { ITheme } from 'typings';
import Spinner from 'components/UI/Spinner';
import styledComponents from 'styled-components';
const styled = styledComponents;

const ButtonText = styled.div`
  color: #fff;
  font-weight: 400;
`;

interface IStyledButton extends IButton, ITheme {}

const StyledButton: any = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  position: relative;
  outline: none;
  background: ${(props: IStyledButton) => props.theme.color.main || '#e0e0e0'};
  transition: background 150ms ease;

  &.disabled {
    background: #ccc;
    cursor: not-allowed;

    > ${ButtonText} {
      color: #fff;
    }
  }

  > ${ButtonText} {
    white-space: nowrap;
    font-size: ${(props: IStyledButton) => {
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
    padding: ${(props: IStyledButton) => {
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
    opacity: ${(props: IStyledButton) => props.loading ? 0 : 1}
  }

  &:not(.disabled):hover {
    background: ${(props: IStyledButton) => darken(0.2, (props.theme.color.main || '#ccc'))};
  }
`;

const SpinnerWrapper = styled.div`
  display: inline-block;
  position: absolute;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button: React.SFC<IButton> = ({ text, size, loading, disabled, onClick, className }) => {
  const handleOnClick = (event: React.FormEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onClick(event);
    }
  };

  return (
    <StyledButton
      size={size}
      loading={loading}
      onClick={handleOnClick}
      disabled={disabled}
      className={`${disabled && 'disabled'} Button ${className}`}
    >
      <ButtonText>{text}</ButtonText>
      {loading && <SpinnerWrapper><Spinner /></SpinnerWrapper>}
    </StyledButton>
  );
};

interface IButton {
  text: string;
  size: string;
  loading: boolean;
  disabled: boolean;
  onClick: (arg: React.FormEvent<HTMLButtonElement>) => void;
  className?: string;
}

export default Button;
