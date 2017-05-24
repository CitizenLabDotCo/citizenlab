/**
*
* LocaleChanger
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Dropdown, Container } from 'semantic-ui-react';

import { appLocales } from '../../i18n';
import messages from './messages';

export const LocaleSelector = (props) => (
  <Dropdown
    className={props.className}
    selection
    text={props.userLocale}
    options={props.options}
    onChange={props.onLocaleChangeClick}
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

  localeChangeClick = (event, result) => {
    this.props.onLocaleChangeClick(result.value);
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
