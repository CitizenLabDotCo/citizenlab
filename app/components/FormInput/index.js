/**
*
* Input
*
*/

import React, { PropTypes } from 'react';
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
  hidden: PropTypes.bool,
};

export default styled(FormInput)`
  visibility: ${props => props.hidden ? 'hidden' : 'visible'};
`;
