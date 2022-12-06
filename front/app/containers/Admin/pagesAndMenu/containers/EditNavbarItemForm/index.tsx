import React from 'react';
import { WrappedComponentProps } from 'react-intl';
// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';
import useNavbarItem from 'hooks/useNavbarItem';
// services
import { updateNavbarItem } from 'services/navbar';
import { getInitialFormValues, createNavbarItemUpdateData } from './utils';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
// utils
import { isNilOrError } from 'utils/helperUtils';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
// components
import NavbarItemForm, { FormValues } from '../../components/NavbarItemForm';

const EditNavbarItemForm = ({
  params: { navbarItemId },
  intl: { formatMessage },
}: WithRouterProps & WrappedComponentProps) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const navbarItem = useNavbarItem({ navbarItemId });
  const localize = useLocalize();

  if (isNilOrError(appConfigurationLocales) || isNilOrError(navbarItem)) {
    return null;
  }

  const handleSubmit = async (values: FormValues) => {
    await updateNavbarItem(
      navbarItemId,
      createNavbarItemUpdateData(navbarItem, values)
    );
  };

  return (
    <SectionFormWrapper
      title={localize(navbarItem.attributes.title_multiloc)}
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: localize(navbarItem.attributes.title_multiloc),
        },
      ]}
    >
      <NavbarItemForm
        defaultValues={getInitialFormValues(navbarItem)}
        onSubmit={handleSubmit}
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(withRouter(EditNavbarItemForm));
