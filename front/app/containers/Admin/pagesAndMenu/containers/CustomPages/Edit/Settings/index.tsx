import React from 'react';

import { omit } from 'lodash-es';

import { TCustomPageCode } from 'api/custom_pages/types';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';

import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';

import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import CustomPageSettingsForm from '../../CustomPageSettingsForm';
// Pages which are not allowed to have their slug edited are linked to internally.
// Changing them would break these links.
// E.g. 'faq'. Search for '/pages/faq' in the front codebase to find out.
// Partly related: HiddenNavbarItemList
const customPageSlugAllowedToEdit: { [key in TCustomPageCode]: boolean } = {
  about: true,
  custom: true,
  faq: false,
  // These pages shouldn't appear on the Pages & menu page at the moment.
  // Just adding them here to comply with types.
  'privacy-policy': false,
  'terms-and-conditions': false,
  'cookie-policy': false,
};

const EditCustomPageSettings = () => {
  const { mutateAsync: updateCustomPage } = useUpdateCustomPage();
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
  const { data: customPage } = useCustomPageById(customPageId);

  if (!isNilOrError(customPage)) {
    const hasNavbarItem = !!customPage.data.relationships.nav_bar_item.data?.id;

    const handleOnSubmit = async (formValues: FormValues) => {
      // the form returns one area_id as a string,
      // the backend expects an array of area_ids
      const isSpaces = formValues.projects_filter_type === 'spaces';
      const newFormValues = {
        ...formValues,
        ...(formValues.projects_filter_type === 'areas' && {
          area_ids: [formValues.area_id],
        }),
        // Clear space_ids when not in spaces mode so the backend removes the join records
        space_ids: isSpaces ? formValues.space_ids ?? [] : [],
      };
      await updateCustomPage({
        id: customPageId,
        ...omit(newFormValues, 'area_id'),
      });
    };

    const topicIds = customPage.data.relationships.global_topics.data.map(
      (topicRelationship) => topicRelationship.id
    );
    const areaIds = customPage.data.relationships.areas.data.map(
      (areaRelationship) => areaRelationship.id
    );
    const spaceIds = customPage.data.relationships.spaces.data.map(
      (spaceRelationship) => spaceRelationship.id
    );

    return (
      <CustomPageSettingsForm
        mode="edit"
        defaultValues={{
          title_multiloc: customPage.data.attributes.title_multiloc,
          ...(hasNavbarItem && {
            nav_bar_item_title_multiloc:
              customPage.data.attributes.nav_bar_item_title_multiloc,
          }),
          slug: customPage.data.attributes.slug,
          projects_filter_type: customPage.data.attributes.projects_filter_type,
          global_topic_ids: topicIds,
          area_id: areaIds[0],
          space_ids: spaceIds,
        }}
        showNavBarItemTitle={hasNavbarItem}
        onSubmit={handleOnSubmit}
        hideSlug={!customPageSlugAllowedToEdit[customPage.data.attributes.code]}
      />
    );
  }

  return null;
};

export default EditCustomPageSettings;
