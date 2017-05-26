import React from 'react';
import PropTypes from 'prop-types';
import LoaderButton from './loader.js';

class ActionButton extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  handleClick = () => {
    this.setState({ loading: true }, () => {
      this.props.action();
    });
  }

  render() {
    const { loading } = this.state;
    const { message, fluid } = this.props;

    return (
      <LoaderButton
        fluid={fluid}
        style={{ float: 'right' }}
        onClick={this.handleClick}
        message={message}
        loading={loading}
      />
    );
  }
}

ActionButton.propTypes = {
  message: PropTypes.object,
  action: PropTypes.func,
  fluid: PropTypes.bool,
};

ActionButton.defaultProps = {
  fluid: false,
};

export default ActionButton;

