/**
*
* Label
*
*/

import React, { PropTypes } from 'react';
// import styled from 'styled-components';

function Label(props) {
  return (
    <label htmlFor={props.id}>{props.label}</label>
  );
}

Label.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default Label;
