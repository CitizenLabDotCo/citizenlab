import React, { memo } from 'react';

import { SupportedLocale } from 'typings';

import { ContentBuilderModelType } from 'api/content_builder/types';

import useLocale from 'hooks/useLocale';

import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

type DescriptionBuilderPreviewProps = {
  modelId: string;
  modelType?: ContentBuilderModelType;
  selectedLocale?: SupportedLocale | null;
};

const DescriptionBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  DescriptionBuilderPreviewProps
>(({ modelId, modelType = 'project', selectedLocale }, ref) => {
  const platformLocale = useLocale();
  const locale = selectedLocale || platformLocale;

  return (
    <EditModePreview
      iframeSrc={`/${locale}/admin/description-builder/${modelType}s/${modelId}/preview?selected_locale=${locale}`}
      ref={ref}
    />
  );
});

export default memo(DescriptionBuilderEditModePreview);
