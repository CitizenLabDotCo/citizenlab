import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import NavbarItemForm, { FormValues } from '../../components/NavbarItemForm';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { createNavbarItemUpdateData, getInitialFormValues } from './utils';

// services
import { updateNavbarItem } from '../../../services/navbar';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';
import useNavbarItem from '../../../hooks/useNavbarItem';

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
