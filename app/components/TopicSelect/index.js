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

const topics = [
  { value: 'one', label: 'one' },
  { value: 'two', label: 'two' },
  { value: 'three', label: 'three' },
  { value: 'four', label: 'four' },
];

const getOptions = () => (
  new Promise((resolve) => setTimeout(() => resolve({ options: topics, complete: true }), 1000))
);


class TopicSelect extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      selected: [],
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(selected) {
    this.setState({ selected });
  }

  /* eslint-disable */
  render() {
    return (
      <div className="cl-topic-select">
        <Select.Async
          name="cl-topic-select"
          value={this.state.selected}
          multi={true}
          loadOptions={getOptions}
          onChange={this.handleChange}
          placeholder="Select topics"
        />
      </div>
    );
  }
  /* eslint-enable */
}

TopicSelect.propTypes = {

};

export default TopicSelect;
