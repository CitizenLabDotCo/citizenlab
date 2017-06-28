import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledLabel = styled.label`
  color: #666;
  font-size: 17px;
  font-weight: 400;
  display: flex;
  padding-bottom: 5px;
`;

const Label = ({ value, htmlFor }) => <StyledLabel htmlFor={htmlFor}>{value}</StyledLabel>;

Label.propTypes = {
  value: PropTypes.string,
  htmlFor: PropTypes.string,
};

Label.defaultProps = {
  value: '',
  htmlFor: '',
};

export default Label;
