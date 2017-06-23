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
  background: ${(props) => props.theme.accentFg || '#e0e0e0'};
  transition: background 150ms ease;

  > ${ButtonText} {
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
          return '11px 16px';
        case '3':
          return '12px 17px';
        case '4':
          return '13px 18px';
        default:
          return '10px 15px';
      }
    }};
    opacity: ${(props) => props.loading ? 0 : 1}
  }

  &:hover {
    background: ${(props) => darken(0.15, (props.theme.accentFg || '#ccc'))};
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

const Button = ({ text, size, loading }) => (
  <StyledButton size={size} loading={loading}>
    <ButtonText>{text}</ButtonText>
    {loading && <SpinnerWrapper><Spinner size="26px" color="#fff" thickness="3px" /></SpinnerWrapper>}
  </StyledButton>
);

Button.propTypes = {
  text: PropTypes.string.isRequired,
  size: PropTypes.string,
  loading: PropTypes.bool,
};

export default Button;
