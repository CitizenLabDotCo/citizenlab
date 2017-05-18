import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Form } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';
import messages from '../../messages';

import { appenDableName } from './utils';

class DropdownInput extends React.PureComponent {
  constructor(props) {
    super();
    const { name } = props;
    const { formatMessage } = props.intl;

    const toAppendName = appenDableName(name);
    const placeholder = formatMessage(messages[`placeholder${toAppendName}`]);
    const label = formatMessage(messages[`label${toAppendName}`]);

    this.state = { placeholder, label };
  }

  handleChange = (event, { value }) => {
    const { name } = this.props;
    this.props.action(name, value);
  };

  render() {
    const { name, options } = this.props;
    const { placeholder, label } = this.state;

    return (
      <Form.Field>
        <label htmlFor={name}>{label}</label>
        <Dropdown
          selection
          options={options}
          fluid
          name={name}
          onChange={this.handleChange}
          placeholder={placeholder}
        />
      </Form.Field>
    );
  }
}

DropdownInput.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  action: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DropdownInput);
