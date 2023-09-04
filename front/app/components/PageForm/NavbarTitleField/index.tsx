import React from 'react';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import { isNilOrError } from 'utils/helperUtils';

import { SectionField } from 'components/admin/Section';
import useNavbarItems from 'api/navbar/useNavbarItems';
import { POLICY_PAGE, TPolicyPage } from 'api/custom_pages/types';

type Props = {
  pageId: string | null;
  navbarItemId: string | null;
};

function isPolicyPageSlug(slug: string): slug is TPolicyPage {
  const termsAndConditionsSlug: TPolicyPage = POLICY_PAGE.termsAndConditions;
  const privacyPolicySlug: TPolicyPage = POLICY_PAGE.privacyPolicy;

  return slug === termsAndConditionsSlug || slug === privacyPolicySlug;
}

const NavbarTitleField = ({
  pageId,
  navbarItemId,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { data: page } = useCustomPageById(pageId ?? undefined);
  const { data: navbarItems } = useNavbarItems();

  const navbarItem = navbarItems?.data.find((item) => item.id === navbarItemId);

  if (
    isNilOrError(page) ||
    isPolicyPageSlug(page.data.attributes.slug) ||
    isNilOrError(navbarItem)
  ) {
    return null;
  }

  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        label={formatMessage(messages.navbarItemTitle)}
        name="nav_bar_item_title_multiloc"
      />
    </SectionField>
  );
};

export default injectIntl(NavbarTitleField);
