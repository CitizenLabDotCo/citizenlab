import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darken } from 'polished';

const StyledButton = styled.button`
  color: #fff;
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
  font-weight: 400;
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
  border-radius: 5px;
  background: ${(props) => props.theme.accentFg || '#e0e0e0'};
  transition: background 150ms ease;

  &:hover {
    background: ${(props) => darken(0.15, (props.theme.accentFg || '#ccc'))};
  }
`;

const Button = ({ text, size }) => <StyledButton size={size}>{text}</StyledButton>;

Button.propTypes = {
  text: PropTypes.string.isRequired,
  size: PropTypes.string,
};

export default Button;
