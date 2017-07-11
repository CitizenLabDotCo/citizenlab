import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  0%    { transform: rotate(0deg); }
  100%  { transform: rotate(360deg); }
`;

const StyledSpinner = styled.div`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  animation: ${rotate} 700ms infinite linear;
  border-style: solid;
  border-right-color: transparent !important;
  border-width: ${(props) => props.thickness};
  border-color: ${(props) => props.color};
  border-radius: 50%;
`;

const Spinner = ({ size, thickness, color }) => <StyledSpinner size={size} thickness={thickness} color={color} />;

Spinner.propTypes = {
  size: PropTypes.string,
  thickness: PropTypes.string,
  color: PropTypes.string,
};

Spinner.defaultProps = {
  size: '26px',
  thickness: '3px',
  color: '#fff',
};

export default Spinner;
