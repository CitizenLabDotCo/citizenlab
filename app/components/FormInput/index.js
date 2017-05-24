/**
*
* Input
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Control } from 'react-redux-form';
import styled from 'styled-components';

function FormInput(props) {
  const model = '.'.concat(props.id);

  return (
    <div className={props.className}>
      <Control.text
        name={props.id}
        model={model}
      />
    </div>
  );
}

FormInput.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default styled(FormInput)`
  visibility: ${(props) => props.hidden ? 'hidden' : 'visible'};
  display: inline-block;
  line-height: 1em;
  border: 1px solid gray;
  margin-left: 10px;
`;
