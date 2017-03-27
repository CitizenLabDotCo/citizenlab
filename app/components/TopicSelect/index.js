/**
*
* TopicSelect
*
*/

import React from 'react';
// import styled from 'styled-components';

// import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
// import messages from './messages';

class TopicSelect extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      selected: [],
      error: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.timer = null;
  }

  componentWillUpdate(nextProps, nextState) {
    if ((nextState.error === true) && (this.timer === null)) {
      this.timer = setTimeout(() => { this.setState({ error: false }); this.timer = null; }, 3000);
    }
  }

  componentWillUnmount() {
    this.timer = null;
  }

  handleChange(selected) {
    if (selected.length <= 3) {
      this.setState({ selected, error: false });
    } else {
      this.setState({ error: true });
    }
  }

  /* eslint-disable */
  render() {
    const { options } = this.props;
    const { selected, error } = this.state;
    const errorDisplay = (error === true) ? 'block' : 'none';

    return (
      <div className="cl-topic-select">
        <Select
          name="cl-topic-select"
          value={selected}
          multi={true}
          options={options}
          onChange={this.handleChange}
          placeholder="Select topics"
        />
        <span style={{ display: errorDisplay, color: 'red' }}>Only 3 topics are allowed</span>
      </div>
    );
  }
  /* eslint-enable */
}

TopicSelect.propTypes = {
  options: React.PropTypes.array,
};

export default TopicSelect;
