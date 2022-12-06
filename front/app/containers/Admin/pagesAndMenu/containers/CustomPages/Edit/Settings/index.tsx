import React from 'react';
import { useParams } from 'react-router-dom';
import useCustomPage from 'hooks/useCustomPage';
import { updateCustomPage } from 'services/customPages';
import { apiEndpoint as navbarItemsEndpoint } from 'services/navbar';
import { isNilOrError } from 'utils/helperUtils';
import streams from 'utils/streams';
import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';
import CustomPageSettingsForm from '../../CustomPageSettingsForm';

const EditCustomPageSettings = () => {
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage({ customPageId });

  if (!isNilOrError(customPage)) {
    const hasNavbarItem = !!customPage.relationships.nav_bar_item.data?.id;

    const handleOnSubmit = async (formValues: FormValues) => {
      await updateCustomPage(customPageId, formValues);
      // navbar items are a separate stream, so manually refresh on title update
      // to reflect changes in the user's navbar
      if (hasNavbarItem) {
        streams.fetchAllWith({
          apiEndpoint: [navbarItemsEndpoint],
        });
      }
    };

    return (
      <CustomPageSettingsForm
        mode="edit"
        defaultValues={{
          title_multiloc: customPage.attributes.title_multiloc,
          ...(hasNavbarItem && {
            nav_bar_item_title_multiloc:
              customPage.attributes.nav_bar_item_title_multiloc,
          }),
          slug: customPage.attributes.slug,
        }}
        showNavBarItemTitle={hasNavbarItem}
        onSubmit={handleOnSubmit}
      />
    );
  }

  return null;
};

export default EditCustomPageSettings;
