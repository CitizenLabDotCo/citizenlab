import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Button as LayOutButton } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const Button = ({ message, loading }) => (
  <LayOutButton fluid size={'small'} style={{ position: 'relative' }}>
    {
      loading ?
        <div style={{ position: 'relative' }}>
          <span style={{ color: 'rgba(0, 0, 0, 0)' }}> o </span>
          <Loader size={'mini'} active />
        </div> :
        <FormattedMessage {...message} />
    }
  </LayOutButton>
);

export default Button;

Button.propTypes = {
  message: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};
