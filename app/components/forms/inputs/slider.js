import React from 'react';
import PropTypes from 'prop-types';

// components
import { Form, Checkbox } from 'semantic-ui-react';

// messages
import { appenDableName } from './utils';
import { injectIntl, intlShape } from 'react-intl';
import messages from './messages';


class Slider extends React.PureComponent {
  constructor(props) {
    super();
    const { name } = props;
    const { formatMessage } = props.intl;
    const toAppendName = appenDableName(name);
    const label = messages[`label${toAppendName}`] && formatMessage(messages[`label${toAppendName}`]);
    this.text = { label };
  }

  handleChange = (event, { checked }) => {
    this.props.action(name, checked);
  };

  render() {
    const { value, checked, name, disabled } = this.props;
    const { label } = this.text;

    return (
      <Form.Field>
        <label htmlFor={name}>{label}</label>
        <Checkbox
          disabled={disabled}
          toggle
          name={name}
          value={value}
          checked={checked}
          onChange={this.handleChange}
        />
      </Form.Field>
    );
  }
}

Slider.propTypes = {
  name: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  checked: PropTypes.bool,
  intl: intlShape.isRequired,
  value: PropTypes.any,
  disabled: PropTypes.bool.isRequired,
};

export default injectIntl(Slider);
