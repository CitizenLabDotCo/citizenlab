import React from 'react';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import usePage from 'hooks/usePage';
import { isNilOrError } from 'utils/helperUtils';
import { POLICY_PAGES, TPolicyPage } from 'services/pages';

type Props = {
  pageId: string | null;
};

const NavbarTitleField = ({
  pageId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const page = usePage({ pageId });
  if (
    isNilOrError(page) ||
    POLICY_PAGES.includes(page.attributes.slug as TPolicyPage)
  ) {
    return null;
  }

  return (
    <InputMultilocWithLocaleSwitcher
      label={formatMessage(messages.navbarItemTitle)}
      type="text"
      name="nav_bar_item_title_multiloc"
    />
  );
};

export default injectIntl(NavbarTitleField);
