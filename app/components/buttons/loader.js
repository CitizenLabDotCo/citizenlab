import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Button as LayOutButton } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const Button = ({ message, loading, onClick, style, fluid, size }) => (
  <LayOutButton size={size} fluid={fluid} style={style} onClick={onClick}>
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

Button.propTypes = {
  message: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  fluid: PropTypes.bool,
  size: PropTypes.string,
};

Button.defaultProps = {
  onClick: () => {},
  fluid: true,
  style: { position: 'relative' },
  size: 'medium',
};

export default Button;
