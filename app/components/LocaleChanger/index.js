/**
*
* LocaleChanger
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Container } from 'semantic-ui-react';
import DropdownInput from 'components/forms/inputs/dropdown';
import { appLocales } from '../../i18n';

import messages from './messages';

export const LocaleSelector = (props) => (
  <DropdownInput
    className={props.className}
    name="locale"
    text={props.userLocale}
    options={props.options}
    action={props.onLocaleChangeClick}
  />
);

const LocaleSelectorStyled = styled(LocaleSelector)`
  margin-left: 10px;
`;

export default class LocaleChanger extends React.PureComponent {
  constructor() {
    super();

    // bind events
    this.localeChangeClick.bind(this);
  }

  localeChangeClick = (name, value) => {
    this.props.onLocaleChangeClick(value);
  };

  render() {
    const { userLocale, locales } = this.props;

    const options = locales.map((locale) => ({
      value: appLocales.filter((appLocale) => appLocale.id === locale)[0].id,
      key: appLocales.filter((appLocale) => appLocale.id === locale)[0].id,
      label: appLocales.filter((appLocale) => appLocale.id === locale)[0].name,
    }));

    return (
      <Container>
        <FormattedMessage {...messages.header} />
        {userLocale && <LocaleSelectorStyled
          onLocaleChangeClick={this.localeChangeClick}
          options={options}
          userLocale={userLocale}
        />}
      </Container>
    );
  }
}

LocaleChanger.propTypes = {
  onLocaleChangeClick: PropTypes.func.isRequired,
  userLocale: PropTypes.string, // received async
  locales: PropTypes.arrayOf(PropTypes.string).isRequired,
};

LocaleSelector.propTypes = {
  onLocaleChangeClick: PropTypes.func.isRequired,
  userLocale: PropTypes.string, // received async
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
};
