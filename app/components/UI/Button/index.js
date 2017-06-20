import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { darken } from 'polished';

const StyledButton = styled.button`
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  padding-top: 8px;
  padding-bottom: 9px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 10px;
  border-radius: 5px;
  background: ${(props) => props.theme.accentFg || '#e0e0e0'};
  transition: background 150ms ease;

  &:hover {
    background: ${(props) => darken(0.15, (props.theme.accentFg || '#ccc'))};
  }
`;

const NormalStyledButton = StyledButton.extend`
  font-size: 16px;
  padding-top: 8px;
  padding-bottom: 9px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 10px;
`;

const MediumStyledButton = StyledButton.extend`
  font-size: 18px;
  padding: 13px 19px;
`;

const LargeStyledButton = StyledButton.extend`
  font-size: 19px;
  padding: 14px 20px;
`;

const Button = ({ text, size }) => {
  if (size === '2') {
    return <MediumStyledButton>{text}</MediumStyledButton>;
  } else if (size === '3') {
    return <LargeStyledButton>{text}</LargeStyledButton>;
  }

  return <NormalStyledButton>{text}</NormalStyledButton>;
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  size: PropTypes.string,
};

export default Button;
