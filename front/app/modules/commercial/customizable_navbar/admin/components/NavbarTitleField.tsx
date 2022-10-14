import React from 'react';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import usePage from 'hooks/usePage';
import { isNilOrError } from 'utils/helperUtils';
import { isPolicyPageSlug } from 'services/pages';
import { SectionField } from 'components/admin/Section';
import useNavbarItem from '../../hooks/useNavbarItem';

type Props = {
  pageId: string | null;
  navbarItemId: string | null;
};

const NavbarTitleField = ({
  pageId,
  navbarItemId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const page = usePage({ pageId });
  const navbarItem = useNavbarItem({ navbarItemId });

  if (
    isNilOrError(page) ||
    isPolicyPageSlug(page.attributes.slug) ||
    isNilOrError(navbarItem)
  ) {
    return null;
  }

  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        label={formatMessage(messages.navbarItemTitle)}
        type="text"
        name="nav_bar_item_title_multiloc"
      />
    </SectionField>
  );
};

export default injectIntl(NavbarTitleField);
