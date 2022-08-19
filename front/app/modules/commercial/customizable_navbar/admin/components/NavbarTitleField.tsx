import React from 'react';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const NavbarTitleField = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  return (
    <InputMultilocWithLocaleSwitcher
      label={formatMessage(messages.navbarItemTitle)}
      type="text"
      name="nav_bar_item_title_multiloc"
    />
  );
};

export default injectIntl(NavbarTitleField);
