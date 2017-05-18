import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';

import { appenDableName } from './utils';
import messages from '../../messages';

class TextInput extends React.Component {
  constructor(props) {
    super();
    const { name } = props;
    const { formatMessage } = props.intl;

    const toAppendName = appenDableName(name);
    const placeholder = formatMessage(messages[`placeholder${toAppendName}`]);
    const label = formatMessage(messages[`label${toAppendName}`]);

    this.state = { placeholder, label };
  }

  handleChange = (event) => {
    const { name } = this.props;
    const { value } = event.target;
    this.props.action(name, value);
    this.setState({ value });
  }

  render() {
    const { placeholder, label } = this.state;
    const { name, icon } = this.props;
    return (
      <Form.Field>
        <Form.Input
          fluid icon={icon || 'user'}
          name={name}
          iconPosition={'left'}
          onChange={this.handleChange}
          value={this.state.value}
          placeholder={placeholder}
          label={label}
        />
      </Form.Field>
    );
  }
}

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  icon: PropTypes.string,
};

export default injectIntl(TextInput);
