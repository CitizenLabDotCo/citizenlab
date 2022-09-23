import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import usePage from 'hooks/usePage';
import React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { isPolicyPageSlug } from 'services/pages';
import { isNilOrError } from 'utils/helperUtils';
import useNavbarItem from '../../hooks/useNavbarItem';
import messages from './messages';

type Props = {
  pageId: string | null;
  navbarItemId: string | null;
};

const NavbarTitleField = ({
  pageId,
  navbarItemId,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
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
