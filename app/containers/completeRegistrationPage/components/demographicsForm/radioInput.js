import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Radio } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';

import { appenDableName } from './utils';

import messages from '../../messages';


class RadioField extends React.PureComponent {
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


class RadioInput extends Component {
  constructor(props) {
    super();
    const { name } = props;
    const { formatMessage } = props.intl;
    const toAppendName = appenDableName(name);
    const label = formatMessage(messages[`label${toAppendName}`]);
    this.state = { label };
  }

  handleChange = (e, { value, name }) => {
    
    const cb = () => this.setState({ currentValue: value });
    this.props.action(name, value, cb);

  }

  render() {
    const { options, name } = this.props;
    const { label, currentValue } = this.state;

    return (
      <Form.Group>
        <Form.Field>
          <label htmlFor={name} > {label} </label>
        </Form.Field>

        {options.map((op) => (
          <RadioField
            key={op.value}
            {...op}
            name={name}
            currentValue={currentValue}
            handleChange={this.handleChange}
          />)
        )}
      </Form.Group>
    );
  }
}

RadioInput.propTypes = {
  name: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  options: PropTypes.array.isRequired,
};

export default injectIntl(RadioInput);
