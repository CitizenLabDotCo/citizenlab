import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darken } from 'polished';
import Spinner from 'components/UI/Spinner';

const ButtonText = styled.div`
  color: #fff;
  font-weight: 400;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  position: relative;
  outline: none;
  background: ${(props) => props.theme.color.main || '#e0e0e0'};
  transition: background 150ms ease;

  &.disabled {
    background: #ccc;
    cursor: not-allowed;

    > ${ButtonText} {
      color: #fff;
    }
  }

  /*
  &.disabled {
    background: #f1f1f2;
    cursor: not-allowed;

    > ${ButtonText} {
      color: #c1c1c1;
    }
  }
  */

  > ${ButtonText} {
    white-space: nowrap;
    font-size: ${(props) => {
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
    padding: ${(props) => {
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
    opacity: ${(props) => props.loading ? 0 : 1}
  }

  &:not(.disabled):hover {
    background: ${(props) => darken(0.2, (props.theme.color.main || '#ccc'))};
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

const Button = ({ text, size, loading, disabled, onClick, className }) => {
  const handleOnClick = (event) => {
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
      { loading && <SpinnerWrapper><Spinner /></SpinnerWrapper> }
    </StyledButton>
  );
};

Button.propTypes = {
  text: PropTypes.string,
  size: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

Button.defaultProps = {
  text: '',
  size: '1',
  disabled: false,
  loading: false,
};

export default Button;
