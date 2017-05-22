import React from 'react';
import PropTypes from 'prop-types';
import { Form, Radio } from 'semantic-ui-react';

export default class RadioField extends React.PureComponent {
  render() {
    const { name, text, value, currentValue, handleChange } = this.props;
    return (
      <Form.Field>
        <Radio
          label={text}
          name={name}
          value={value}
          checked={currentValue === value}
          onChange={handleChange}
        />
      </Form.Field>
    );
  }
}

RadioField.propTypes = {
  name: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  currentValue: PropTypes.any.isRequired,
  handleChange: PropTypes.func.isRequired,
};
