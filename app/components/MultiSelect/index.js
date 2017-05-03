/**
*
* TopicSelect
* https://github.com/CitizenLabDotCo/cl2-front/wiki/docs_TopicSelect
*
*/

import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';

import messages from './messages';

class MultiSelect extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
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
      this.props.handleOptionsAdded(selected);
    } else {
      this.setState({ error: true });
    }
  }

  /* eslint-disable */
  render() {
    const { options, maxSelectionLength, optionLabel, placeholder } = this.props;
    const { selected, error } = this.state;

    return (
      <div className="cl-topic-select">
        <Select
          name="cl-topic-select"
          value={selected}
          multi={true}
          options={options}
          onChange={this.handleChange}
          placeholder={placeholder}
        />
        {error && <FormattedMessage
          {...messages.selectionTooLong}
          values={{
            maxSelectionLength,
            optionLabel,
          }}
        />}
      </div>
    );
  }
  /* eslint-enable */
}

MultiSelect.propTypes = {
  options: PropTypes.array.isRequired,
  maxSelectionLength: PropTypes.number.isRequired,
  optionLabel: PropTypes.string.isRequired,
  handleOptionsAdded: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
};

export default MultiSelect;
