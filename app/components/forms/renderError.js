import React from 'react';
import { PropTypes } from 'prop-types';
import { Label } from 'semantic-ui-react';

import { FormattedMessage } from 'react-intl';

const RenderError = ({ message, showError }) => {
  if (!showError || !message) return null;
  return (
    <Label basic color={'red'} style={{ float: 'right' }} >
      <FormattedMessage {...message} />
    </Label>
  );
};

RenderError.propTypes = {
  message: PropTypes.object,
  showError: PropTypes.bool,
};

export default RenderError;
