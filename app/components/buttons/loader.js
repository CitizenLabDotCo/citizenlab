import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Button as LayOutButton } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const Button = (props) => (
  <LayOutButton {...props}>
    {
      props.loading ?
        <div style={{ position: 'relative' }}>
          <span style={{ color: 'rgba(0, 0, 0, 0)' }}> o </span>
          <Loader size={'mini'} active />
        </div> :
        <FormattedMessage {...props.message} />
    }
  </LayOutButton>
);

Button.propTypes = {
  message: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  onCLick: PropTypes.func,
  style: PropTypes.object,
};

Button.defaultProps = {
  onCLick: () => {},
  fluid: true,
  style: { position: 'relative' },
  size: 'small',
};

export default Button;
