import React from 'react';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import useCustomPage from 'hooks/useCustomPage';
import { isNilOrError } from 'utils/helperUtils';
import { isPolicyPageSlug } from 'services/customPages';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import usePage from 'hooks/usePage';
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { isPolicyPageSlug } from 'services/pages';
import { injectIntl } from 'utils/cl-intl';
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
  const page = useCustomPage({ customPageId: pageId });
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
