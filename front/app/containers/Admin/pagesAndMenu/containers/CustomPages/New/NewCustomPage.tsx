import React from 'react';

import { omit } from 'lodash-es';

import useAddCustomPage from 'api/custom_pages/useAddCustomPage';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';

import clHistory from 'utils/cl-router/history';

import CustomPageSettingsForm from '../CustomPageSettingsForm';

const NewCustomPage = () => {
  const { mutateAsync: createCustomPage } = useAddCustomPage();
  const customPageBuilderEnabled = useFeatureFlag({
    name: 'custom_page_builder',
  });
  const handleOnSubmit = async (formValues: FormValues) => {
    // the form returns one area_id as a string,
    // the backend expects an array of area_ids
    const isSpaces = formValues.projects_filter_type === 'spaces';
    const newFormValues = {
      ...formValues,
      ...(formValues.projects_filter_type === 'areas' && {
        area_ids: formValues.area_id ? [formValues.area_id] : [],
      }),
      space_ids: isSpaces ? formValues.space_ids ?? [] : [],
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
        space_ids: [],
        global_topic_ids: [],
      }}
      hideSlug
      // A new page is a global custom page, and the content builder lists projects through its
      // own widgets.
      hideLinkedItems={customPageBuilderEnabled}
    />
  );
};

export default NewCustomPage;
