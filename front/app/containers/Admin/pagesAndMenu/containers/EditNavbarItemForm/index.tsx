import React from 'react';

import { useParams } from 'react-router-dom';

import useNavbarItems from 'api/navbar/useNavbarItems';
import useUpdateNavbarItem from 'api/navbar/useUpdateNavbarItem';

import useLocalize from 'hooks/useLocalize';

import {
  pagesAndMenuBreadcrumb,
  pagesAndMenuBreadcrumbLinkTo,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import NavbarItemForm, { FormValues } from '../../components/NavbarItemForm';

import { getInitialFormValues, createNavbarItemUpdateData } from './utils';

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
          linkTo: pagesAndMenuBreadcrumbLinkTo,
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
