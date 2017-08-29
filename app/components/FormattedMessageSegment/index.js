/**
*
* FormattedMessageSegment
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Segment } from 'semantic-ui-react';

function FormattedMessageSegment({ message, values }) {
  return (
    <Segment>
      <FormattedMessage
        {...message}
        values={values}
      />
    </Segment>
  );
}

FormattedMessageSegment.propTypes = {
  message: PropTypes.object.isRequired,
  values: PropTypes.object,
};

export default FormattedMessageSegment;
