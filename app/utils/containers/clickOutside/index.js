import React from 'react';
import PropTypes from 'prop-types';

class ClickOutside extends React.Component {
  static propTypes = {
    onClickOutside: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.getContainer = this.getContainer.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.handle, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handle, true);
  }

  getContainer(ref) {
    this.container = ref;
  }

  handle = (event) => {
    const { onClickOutside } = this.props;
    const el = this.container;

    if (!el.contains(event.target)) {
      onClickOutside(event);
    }
  };

  render() {
    const { children, ...props } = this.props;
    return <div {...props} ref={this.getContainer}>{children}</div>;
  }
}

ClickOutside.propTypes = {
  children: PropTypes.any.isRequired,
  onClickOutside: PropTypes.func.isRequired,
};

export default ClickOutside;
