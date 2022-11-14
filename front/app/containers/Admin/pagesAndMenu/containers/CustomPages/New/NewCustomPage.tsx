import React from 'react';
import CustomPageSettingsForm from '../CustomPageSettingsForm';
import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';
import { createCustomPage } from 'services/customPages';
import clHistory from 'utils/cl-router/history';

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

  return (
    <CustomPageSettingsForm
      mode="new"
      onSubmit={handleOnSubmit}
      defaultValues={{
        projects_filter_type: 'no_filter',
      }}
    />
  );
};

export default NewCustomPage;
