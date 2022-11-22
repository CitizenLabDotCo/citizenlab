import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';
import React from 'react';
import { createCustomPage } from 'services/customPages';
import clHistory from 'utils/cl-router/history';
import CustomPageSettingsForm from '../CustomPageSettingsForm';

const NewCustomPage = () => {
  const handleOnSubmit = async (formValues: FormValues) => {
    const { data } = await createCustomPage(formValues);

    // Without the redirect was too sudden
    // (with a short flash of the success message in between)
    setTimeout(
      () => clHistory.push(`/admin/pages-menu/pages/${data.id}/settings`),
      1500
    );
  };

  return <CustomPageSettingsForm mode="new" onSubmit={handleOnSubmit} />;
};

export default NewCustomPage;
