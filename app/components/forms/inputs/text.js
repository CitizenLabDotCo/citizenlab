import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';

import RenderError from 'components/forms/renderError';

import { appenDableName, toCammelCase } from './utils';
import messages from './messages';

class TextInput extends React.PureComponent {
  constructor(props) {
    super();
    const { name, initialValue } = props;
    const { formatMessage } = props.intl;
    const type = (name === 'password') ? name : 'text';
    const toAppendName = appenDableName(name);
    const placeholder = formatMessage(messages[`placeholder${toAppendName}`]);
    const label = formatMessage(messages[`label${toAppendName}`]);
    this.text = { placeholder, label, type };
    this.state = { showError: true, value: initialValue || '' };
  }

  componentWillReceiveProps(newProps) {
    const newState = { showError: true };
    if (newProps.initialValue && !this.props.initialValue) {
      newState.value = newProps.initialValue;
    }
    this.setState(newState);
  }

  icons = {
    email: 'mail',
    password: 'lock',
    first_name: 'user',
    last_name: 'user',
  }

  handleChange = (event) => {
    const { name } = this.props;
    const { value } = event.target;
    this.props.action(name, value);
    this.setState({ value });
  }

  handleFocus = () => {
    this.setState({ showError: false });
  }

  render() {
    const { name, errors } = this.props;
    const { placeholder, label, type } = this.text;
    const { showError, value } = this.state;
    const error = errors && messages[toCammelCase(errors.slice(-1)[0])];
    const icon = this.icons[name];
    return (
      <Form.Field>
        <Form.Input
          onFocus={this.handleFocus}
          fluid icon={icon}
          name={name}
          iconPosition={'left'}
          onChange={this.handleChange}
          // initialValue admissible only when no existing value is set
          value={value}
          placeholder={placeholder}
          error={!!(error && showError)}
          type={type}
          label={label}
        />
        <RenderError message={error} showError={showError} />
      </Form.Field>
    );
  }
}

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  initialValue: PropTypes.string,
  action: PropTypes.func.isRequired,
  intl: intlShape,
  errors: PropTypes.array,
};

export default injectIntl(TextInput);
