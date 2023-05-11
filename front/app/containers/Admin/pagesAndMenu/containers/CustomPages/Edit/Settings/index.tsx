import React from 'react';
import CustomPageSettingsForm from '../../CustomPageSettingsForm';
import useCustomPage from 'hooks/useCustomPage';
import { useParams } from 'react-router-dom';
import { isNilOrError } from 'utils/helperUtils';
import { TPageCode, updateCustomPage } from 'services/customPages';
import { FormValues } from 'containers/Admin/pagesAndMenu/containers/CustomPages/CustomPageSettingsForm';
import streams from 'utils/streams';
import { apiEndpoint as navbarItemsEndpoint } from 'services/navbar';
import { omit } from 'lodash-es';

const customPagesAllowedToEditSlug: TPageCode[] = ['about', 'custom'];

const EditCustomPageSettings = () => {
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage({ customPageId });

  if (!isNilOrError(customPage)) {
    const hasNavbarItem = !!customPage.relationships.nav_bar_item.data?.id;

    const handleOnSubmit = async (formValues: FormValues) => {
      // the form returns one area_id as a string,
      // the backend expects an array of area_ids
      const newFormValues = {
        ...formValues,
        ...(formValues.projects_filter_type === 'areas' && {
          area_ids: [formValues.area_id],
        }),
      };
      await updateCustomPage(customPageId, omit(newFormValues, 'area_id'));
      // navbar items are a separate stream, so manually refresh on title update
      // to reflect changes in the user's navbar
      if (hasNavbarItem) {
        streams.fetchAllWith({
          apiEndpoint: [navbarItemsEndpoint],
        });
      }
    };

    const topicIds = customPage.relationships.topics.data.map(
      (topicRelationship) => topicRelationship.id
    );
    const areaIds = customPage.relationships.areas.data.map(
      (areaRelationship) => areaRelationship.id
    );

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
          projects_filter_type: customPage.attributes.projects_filter_type,
          topic_ids: topicIds,
          area_id: areaIds[0],
        }}
        showNavBarItemTitle={hasNavbarItem}
        onSubmit={handleOnSubmit}
        hideSlug={
          !customPagesAllowedToEditSlug.includes(customPage.attributes.code)
        }
      />
    );
  }

  return null;
};

export default EditCustomPageSettings;
