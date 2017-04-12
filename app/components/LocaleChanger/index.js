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
    value={props.userLocale}
    options={props.options}
    onChange={props.onLocaleChangeClick}
  />
);

export default class LocaleChanger extends React.PureComponent {
  constructor() {
    super();

    // bind events
    this.localeChangeClick.bind(this);
  }

  localeChangeClick = (result) => {
    this.props.onLocaleChangeClick(result.value);
  };

  render() {
    const options = appLocales.map((appLocale) => ({
      value: appLocale.id,
      label: appLocale.name,
    }));

    return (
      <div>
        <FormattedMessage {...messages.header} />
        {this.props.userLocale && <LocaleSelector
          onLocaleChangeClick={this.localeChangeClick}
          options={options}
          userLocale={this.props.userLocale}
        />}
      </div>
    );
  }
}

LocaleChanger.propTypes = {
  onLocaleChangeClick: PropTypes.func.isRequired,
  userLocale: PropTypes.string, // received async
};

LocaleSelector.propTypes = {
  onLocaleChangeClick: PropTypes.func.isRequired,
  userLocale: PropTypes.string, // received async
  options: PropTypes.array.isRequired,
};
