import React from 'react';

import { WrappedComponentProps } from 'react-intl';

import { POLICY_PAGE, TPolicyPage } from 'api/custom_pages/types';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useNavbarItems from 'api/navbar/useNavbarItems';

import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

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
