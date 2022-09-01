import React, { useState } from 'react';

import { useParams } from 'react-router-dom';
import useCustomPage from 'hooks/useCustomPage';
import GenericHeroBannerForm from '../../../GenericHeroBannerForm';
import { isNilOrError } from 'utils/helperUtils';

const EditCustomPageHeroBannerForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);
  if (isNilOrError(customPage)) {
    return null;
  }

  const { attributes } = customPage;

  const handleSave = (data) => {
    setIsLoading(false);
    // @ts-ignore
    return data;
  };

  return (
    <div>
      <GenericHeroBannerForm
        handleOnSave={handleSave}
        type="customPage"
        banner_layout={attributes.banner_layout}
        banner_overlay_color={attributes.banner_overlay_color}
        banner_overlay_opacity={attributes.banner_overlay_opacity}
        banner_header_multiloc={attributes.banner_header_multiloc}
        banner_subheader_multiloc={attributes.banner_subheader_multiloc}
        header_bg={attributes.header_bg}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditCustomPageHeroBannerForm;
