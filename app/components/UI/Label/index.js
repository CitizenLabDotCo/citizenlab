import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledLabel = styled.label`
  color: #666;
  font-size: 17px;
  font-weight: 500;
  display: flex;
  padding-bottom: 4px;
`;

const Label = ({ value, htmlFor }) => <StyledLabel htmlFor={htmlFor}>{value}</StyledLabel>;

Label.propTypes = {
  value: PropTypes.string.isRequired,
  htmlFor: PropTypes.string,
};

export default Label;
