import React from 'react';
import CustomPageSettingsForm from '../../CustomPageSettingsForm';
import useCustomPage from 'hooks/useCustomPage';
import { useParams } from 'react-router-dom';
import { isNilOrError } from 'utils/helperUtils';

const EditCustomPageSettings = () => {
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);

  if (!isNilOrError(customPage)) {
    return (
      <CustomPageSettingsForm
        defaultValues={{
          title_multiloc: customPage.attributes.title_multiloc,
          slug: customPage.attributes.slug,
        }}
      />
    );
  }

  return null;
};

export default EditCustomPageSettings;
