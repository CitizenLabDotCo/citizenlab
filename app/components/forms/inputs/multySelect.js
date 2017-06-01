import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Form } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';
import messages from './messages';
import { appenDableName } from './utils';

class DropdownInput extends React.PureComponent {
  constructor(props) {
    super();
    const { name } = props;
    const { formatMessage } = props.intl;

    const toAppendName = appenDableName(name);
    const placeholder = formatMessage(messages[`placeholder${toAppendName}`]);
    const label = formatMessage(messages[`label${toAppendName}`]);
    const noResult = formatMessage(messages.noResultsMessage);
    this.state = { placeholder, label, noResult };
  }

  handleChange = (event, { value }) => {
    const { name } = this.props;
    this.props.action(name, value);
  };

  render() {
    const { name, options, text } = this.props;
    const { placeholder: ph, label } = this.state;

    const placeholder = (text ? null : ph);

    return (
      <Form.Field>
        <label htmlFor={name}>{label}</label>
        <Dropdown
          closeOnChange
          multiple
          scrolling
          search
          selection
          fluid
          placeholder={placeholder}
          renderLabel={this.valueRenderer}
          onChange={this.handleChange}
          options={options}
          noResultsMessage={noResult}
        />
      </Form.Field>
    );
  }
}

DropdownInput.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  action: PropTypes.func.isRequired,
  text: PropTypes.string,
  intl: intlShape.isRequired,
};

export default injectIntl(DropdownInput);
