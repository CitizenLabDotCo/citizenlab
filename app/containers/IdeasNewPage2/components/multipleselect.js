import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import _ from 'lodash';

class MultipleSelect extends React.Component {
  handleChange = (event, data) => {
    let value = data.value;

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
        onChange={this.handleChange}
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
