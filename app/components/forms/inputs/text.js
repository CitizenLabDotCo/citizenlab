import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';

import { appenDableName, toCammelCase } from './utils';
import messages from './messages';

import RenderError from 'components/forms/renderError';

class TextInput extends React.PureComponent {
  constructor(props) {
    super();
    const { name } = props;
    const { formatMessage } = props.intl;
    const type = (name === 'password') ? name : 'text';
    const toAppendName = appenDableName(name);
    const placeholder = formatMessage(messages[`placeholder${toAppendName}`]);
    const label = formatMessage(messages[`label${toAppendName}`]);
    this.text = { placeholder, label, type };
    this.state = { showError: true, value: '' };
  }

  componentWillReceiveProps() {
    this.setState({ showError: true });
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
  action: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  errors: PropTypes.array,
};

export default injectIntl(TextInput);
