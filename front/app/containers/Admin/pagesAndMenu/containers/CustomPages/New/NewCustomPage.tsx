import React from 'react';
import CustomPageSettingsForm from '../CustomPageSettingsForm';
import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';
import { createCustomPage } from 'services/customPages';
import clHistory from 'utils/cl-router/history';
import { omit } from 'lodash-es';

const NewCustomPage = () => {
  const handleOnSubmit = async (formValues: FormValues) => {
    // the form returns one area_id as a string,
    // the backend expects an array of area_ids
    const newFormValues = {
      ...formValues,
      ...(formValues.projects_filter_type === 'areas' && {
        area_ids: [formValues.area_id],
      }),
    };

    const { data } = await createCustomPage(omit(newFormValues, 'area_id'));

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
        area_id: null,
        topic_ids: [],
      }}
    />
  );
};

export default NewCustomPage;
