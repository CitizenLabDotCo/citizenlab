import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import T from 'containers/T';
import { Dropdown } from 'semantic-ui-react';
import { injectTFunc } from 'containers/T/utils';
import styled from 'styled-components';

import messages from './messages';

const Container = styled.div`
  width: 100%;
`;

export const optionRendered = (option) => (<span>
  <T value={JSON.parse(option.label)} />
</span>);


class MultiSelectT extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      error: false,
    };

    // provide 'this' context to bindings
    this.handleChange = this.handleChange.bind(this);
    this.valueRenderer = this.valueRenderer.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    this.setState({ error: nextState.error });
  }

  valueRenderer = ({ text }) => {
    const { tFunc } = this.props;
    return tFunc(JSON.parse(text));
  };

  handleChange(e, data) {
    const { maxSelectionLength } = this.props;

    const options = data.value;
    this.props.handleOptionsAdded(options);
    this.setState({ error: options.length > maxSelectionLength });
  }

  /* eslint-disable */
  render() {
    const { options, maxSelectionLength, optionLabel, placeholder, name } = this.props;
    const { error } = this.state;
    const { formatMessage } = this.props.intl;

    return (
      <Container>
        <Dropdown
          closeOnChange
          multiple
          scrolling
          search
          selection
          fluid
          name={name}
          placeholder={placeholder}
          renderLabel={this.valueRenderer}
          onChange={this.handleChange}
          options={options}
          noResultsMessage={formatMessage(messages.noResultsMessage)}
        />
        {error && <div><FormattedMessage
          {...messages.selectionTooLong}
          values={{
            maxSelectionLength,
            optionLabel,
          }}
        /></div>}
      </Container>
    );
  }
  /* eslint-enable */
}

MultiSelectT.propTypes = {
  options: PropTypes.array.isRequired,
  maxSelectionLength: PropTypes.number.isRequired,
  optionLabel: PropTypes.string.isRequired,
  handleOptionsAdded: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  tFunc: PropTypes.func.isRequired,
};

export default injectTFunc(injectIntl(MultiSelectT));
