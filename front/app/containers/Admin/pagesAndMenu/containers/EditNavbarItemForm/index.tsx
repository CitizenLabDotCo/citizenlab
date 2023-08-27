import React from 'react';

// components
import NavbarItemForm, { FormValues } from '../../components/NavbarItemForm';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getInitialFormValues, createNavbarItemUpdateData } from './utils';

// i18n
import { useIntl } from 'utils/cl-intl';

// hooks
import useLocalize from 'hooks/useLocalize';
import useNavbarItems from 'api/navbar/useNavbarItems';

import useUpdateNavbarItem from 'api/navbar/useUpdateNavbarItem';
import { useParams } from 'react-router-dom';

const EditNavbarItemForm = () => {
  const { navbarItemId } = useParams() as { navbarItemId: string };
  const { formatMessage } = useIntl();
  const { data: navbarItems } = useNavbarItems();
  const { mutateAsync: updateNavbarItem } = useUpdateNavbarItem();

  const navbarItem = navbarItems?.data.find((item) => item.id === navbarItemId);
  const localize = useLocalize();

  if (isNilOrError(navbarItem)) {
    return null;
  }

  const handleSubmit = async (values: FormValues) => {
    await updateNavbarItem({
      id: navbarItemId,
      title_multiloc: createNavbarItemUpdateData(navbarItem, values)
        .title_multiloc,
    });
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

export default EditNavbarItemForm;
