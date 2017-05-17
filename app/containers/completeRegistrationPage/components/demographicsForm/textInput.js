import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import { injectIntl } from 'react-intl';
import { preprocess } from 'utils';

import { appenDableName } from './utils';
import messages from '../../messages';

class TextInput extends React.Component {
  state = {}

  handleChange = (event) => {
    const value = event.target.value;
    const field = event.target.name;
    this.setState({ [field]: value });
  }

  render() {
    const { name, placeholder, label } = this.props;
    return (
      <Form.Field>
        <Form.Input
          fluid icon={'user'}
          name={name}
          iconPosition={'left'}
          onChange={this.handleChange}
          placeholder={placeholder}
          label={label}
        />
      </Form.Field>
    );
  }
}

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const mergeProps = (stateP, dispatchP, ownP) => {
  const { name } = ownP;
  const { formatMessage } = ownP.intl;
  const toAppendName = appenDableName(name);
  const placeholder = formatMessage(messages[`placeholder${toAppendName}`]);
  const label = formatMessage(messages[`label${toAppendName}`]);
  return { name, placeholder, label };
};

export default injectIntl(preprocess(null, null, mergeProps)(TextInput));
