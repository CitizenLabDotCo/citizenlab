import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';

import { appenDableName } from './utils';

import RadioField from './radioField';
import messages from './messages';

class RadioInput extends React.Component {
  constructor(props) {
    super();
    const { name } = props;
    const { formatMessage } = props.intl;
    const toAppendName = appenDableName(name);
    const label = formatMessage(messages[`label${toAppendName}`]);
    this.state = { label };
  }

  handleChange = (e, { value, name }) => {
    this.setState({ currentValue: value });
    this.props.action(name, value);
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
