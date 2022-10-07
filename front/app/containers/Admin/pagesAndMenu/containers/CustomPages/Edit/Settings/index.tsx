import React from 'react';
import CustomPageSettingsForm from '../../CustomPageSettingsForm';
import useCustomPage from 'hooks/useCustomPage';
import { useParams } from 'react-router-dom';
import { isNilOrError } from 'utils/helperUtils';
import { ICustomPageData, updateCustomPage } from 'services/customPages';
import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';
import useNavbarItem from 'modules/commercial/customizable_navbar/hooks/useNavbarItem';

const EditCustomPageSettings = () => {
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);
  const nav_bar_item_title_multiloc = useNavBarItemTitleMultiloc(customPage);

  const handleOnSubmit = async (formValues: FormValues) => {
    await updateCustomPage(customPageId, formValues);
  };

  if (!isNilOrError(customPage)) {
    return (
      <CustomPageSettingsForm
        mode="edit"
        defaultValues={{
          title_multiloc: customPage.attributes.title_multiloc,
          nav_bar_item_title_multiloc,
          slug: customPage.attributes.slug,
        }}
        onSubmit={handleOnSubmit}
      />
    );
  }

  return null;
};

const useNavBarItemTitleMultiloc = (
  customPage: ICustomPageData | null | Error
) => {
  const navbarItemId = !isNilOrError(customPage)
    ? customPage.relationships.nav_bar_item?.data?.id ?? null
    : null;
  const navbarItem = useNavbarItem({ navbarItemId });
  return isNilOrError(navbarItem)
    ? undefined
    : navbarItem.attributes.title_multiloc;
};

export default EditCustomPageSettings;
