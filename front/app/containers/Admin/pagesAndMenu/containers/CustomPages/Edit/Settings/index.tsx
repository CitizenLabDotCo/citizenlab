import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';
import useCustomPage from 'hooks/useCustomPage';
import React from 'react';
import { useParams } from 'react-router-dom';
import { updateCustomPage } from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';
import CustomPageSettingsForm from '../../CustomPageSettingsForm';

const EditCustomPageSettings = () => {
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);

  const handleOnSubmit = async (formValues: FormValues) => {
    await updateCustomPage(customPageId, formValues);
  };

  if (!isNilOrError(customPage)) {
    return (
      <CustomPageSettingsForm
        mode="edit"
        defaultValues={{
          title_multiloc: customPage.attributes.title_multiloc,
          slug: customPage.attributes.slug,
        }}
        onSubmit={handleOnSubmit}
      />
    );
  }

  return null;
};

export default EditCustomPageSettings;
