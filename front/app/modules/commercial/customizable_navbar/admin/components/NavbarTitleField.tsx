import React from 'react';
import { InputMultilocWithLocaleSwitcher } from '@citizenlab/cl2-component-library';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const NavbarTitleField = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  return (
    <InputMultilocWithLocaleSwitcher
      label={formatMessage(messages.navbarItemTitle)}
      type="text"
      name="nav_bar_item_title_multiloc"
      // ToDO: remove next two lines
      valueMultiloc={undefined}
      locales={[]}
    />
  );
};

export default injectIntl(NavbarTitleField);
