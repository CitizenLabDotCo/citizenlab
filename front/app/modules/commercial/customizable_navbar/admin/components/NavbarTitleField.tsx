import React from 'react';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import usePage from 'hooks/usePage';
import { isNilOrError } from 'utils/helperUtils';
import { isPolicyPageSlug } from 'services/pages';
import { SectionField } from 'components/admin/Section';

type Props = {
  pageId: string | null;
};

const NavbarTitleField = ({
  pageId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const page = usePage({ pageId });

  if (isNilOrError(page) || isPolicyPageSlug(page.attributes.slug)) {
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
