/**
*
* TopicSelect
* https://github.com/CitizenLabDotCo/cl2-front/wiki/docs_TopicSelect
*
*/

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import T, { fallbackTenantLocales, fallbackUserLocale } from 'containers/T';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { findTranslatedText } from 'containers/T//utils';
import { createStructuredSelector } from 'reselect';
import ImmutablePropTypes from 'react-immutable-proptypes';

import messages from './messages';

class MultiSelectT extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      selected: [],
      error: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.valueRenderer = this.valueRenderer.bind(this);
    this.timer = null;
  }

  componentWillUpdate(nextProps, nextState) {
    if ((nextState.error === true) && (this.timer === null)) {
      this.timer = setTimeout(() => { this.setState({ error: false }); this.timer = null; }, 3000);
    }
  }

  componentWillUnmount() {
    this.timer = null;
  }

  handleChange(selected) {
    if (selected.length <= 3) {
      this.setState({ selected, error: false });
      this.props.handleOptionsAdded(selected);
    } else {
      this.setState({ error: true });
    }
  }

  optionRendered(option) {
    return (
      <T value={JSON.parse(option.label)} />
    );
  }

  valueRenderer(option) {
    // we must do manual parsing to extract the original text from <T>
    const { userLocale, tenantLocales } = this.props;

    return (<span
      dangerouslySetInnerHTML={{ __html: findTranslatedText(JSON.parse(option.label), userLocale || fallbackUserLocale, tenantLocales || fallbackTenantLocales) }}
    />);
  }

  /* eslint-disable */
  render() {
    const { options, maxSelectionLength, optionLabel, placeholder } = this.props;
    const { selected, error } = this.state;

    return (
      <div className="cl-topic-select">
        <Select
          name="cl-topic-select"
          value={selected}
          multi={true}
          options={options}
          optionRenderer={this.optionRendered}
          valueRenderer={this.valueRenderer}
          onChange={this.handleChange}
          placeholder={placeholder}
        />
        {error && <FormattedMessage
          {...messages.selectionTooLong}
          values={{
            maxSelectionLength,
            optionLabel,
          }}
        />}
      </div>
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
  userLocale: PropTypes.string,
  tenantLocales: ImmutablePropTypes.list,
};

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
  tenantLocales: makeSelectSetting(['core', 'locales']),
});

export default connect(mapStateToProps)(MultiSelectT);
