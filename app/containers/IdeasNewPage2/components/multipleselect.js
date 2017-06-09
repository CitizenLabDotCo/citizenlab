import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import _ from 'lodash';

class MultipleSelect extends React.Component {
  handleOnChange = (event, data) => {
    let value = data.value;

    // Check if the 'max' attribute has been set.
    // If so, check if the currently selected items count is larger than the max value.
    // If so, emit the previous array of selected items instead of the new one.
    if (this.props.max && _.has(data, 'value.length')) {
      value = (data.value.length > this.props.max ? this.props.value : value);
    }

    this.props.onChange(value);
  }

  render() {
    return (
      <Dropdown
        closeOnChange
        multiple
        scrolling
        selection
        fluid
        value={this.props.value}
        placeholder={this.props.placeholder}
        options={this.props.options}
        onChange={this.handleOnChange}
      />
    );
  }
}

MultipleSelect.propTypes = {
  value: PropTypes.array.isRequired,
  placeholder: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  max: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default MultipleSelect;
