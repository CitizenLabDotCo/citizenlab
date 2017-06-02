import React from 'react';
import PropTypes from 'prop-types';

class ClickOutside extends React.Component {
  componentDidMount() {
    document.addEventListener('click', this.handle, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handle, true);
  }

  getContainer = (ref) => {
    this.container = ref;
  }

  handle = (event) => {
    const { onClickOutside } = this.props;

    if (this.container && !this.container.contains(event.target)) {
      onClickOutside(event);
    }
  };

  render() {
    const { children, onClickOutside, ...props } = this.props; // eslint-disable-line
    return <div {...props} ref={this.getContainer}>{children}</div>;
  }
}

ClickOutside.propTypes = {
  children: PropTypes.any.isRequired,
  onClickOutside: PropTypes.func.isRequired,
};

export default ClickOutside;
