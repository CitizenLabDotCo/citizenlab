/**
*
* LocaleChanger
*
*/

import React, { PropTypes } from 'react';
// import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';

import { appLocales } from '../../i18n';
import messages from './messages';

export const LocaleSelector = (props) => (
  <Select
    name="form-field-name"
    value={props.currentLocale}
    options={props.options}
    onChange={props.onLocaleChangeClick}
  />
);

export default class LocaleChanger extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      currentLocale: 'en',
    };

    // bind events
    this.localeChangeClick.bind(this);
  }

  localeChangeClick = (result) => {
    const newLocale = result.value;

    this.props.onLocaleChangeClick(newLocale);
    this.setState({
      currentLocale: newLocale,
    });
  };

  render() {
    const options = appLocales.map((appLocale) => ({
      value: appLocale.id,
      label: appLocale.name,
    }));

    const { currentLocale } = this.props;

    return (
      <div>
        <FormattedMessage {...messages.header} />
        <FormattedMessage {...messages.appReload} />
        <LocaleSelector
          onLocaleChangeClick={this.localeChangeClick}
          currentLocale={currentLocale}
          options={options}
        />
      </div>
    );
  }
}

LocaleChanger.propTypes = {
  onLocaleChangeClick: PropTypes.func.isRequired,
  currentLocale: PropTypes.string.isRequired,
};

LocaleSelector.propTypes = {
  onLocaleChangeClick: PropTypes.func.isRequired,
  currentLocale: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
};
