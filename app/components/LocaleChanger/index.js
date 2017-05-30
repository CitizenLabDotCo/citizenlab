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
    const options = appLocales.map((appLocale) => ({
      value: appLocale.id,
      key: appLocale.id,
      label: appLocale.name,
    }));

    const { userLocale } = this.props;

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
};

LocaleSelector.propTypes = {
  onLocaleChangeClick: PropTypes.func.isRequired,
  userLocale: PropTypes.string, // received async
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
};
