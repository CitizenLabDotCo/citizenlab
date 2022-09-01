import React from 'react';
import CustomPageSettingsForm from '../CustomPageSettingsForm';
import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';
import { createCustomPage } from 'services/customPages';
import clHistory from 'utils/cl-router/history';

const NewCustomPage = () => {
  const handleOnSubmit = async (formValues: FormValues) => {
    const { data } = await createCustomPage(formValues);

    clHistory.push(`/admin/pages-menu/custom/${data.id}/content`);
  };

  return <CustomPageSettingsForm mode="new" onSubmit={handleOnSubmit} />;
};

export default NewCustomPage;
