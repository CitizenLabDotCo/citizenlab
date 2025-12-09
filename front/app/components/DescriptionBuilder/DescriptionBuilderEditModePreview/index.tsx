import React, { memo } from 'react';

import { SupportedLocale } from 'typings';

import { ContentBuildableType } from 'api/content_builder/types';

import useLocale from 'hooks/useLocale';

import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

type DescriptionBuilderPreviewProps = {
  contentBuildableId: string;
  contentBuildableType?: ContentBuildableType;
  selectedLocale?: SupportedLocale | null;
};

const DescriptionBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  DescriptionBuilderPreviewProps
>(
  (
    { contentBuildableId, contentBuildableType = 'project', selectedLocale },
    ref
  ) => {
    const platformLocale = useLocale();
    const locale = selectedLocale || platformLocale;

    return (
      <EditModePreview
        iframeSrc={`/${locale}/admin/description-builder/${contentBuildableType}s/${contentBuildableId}/preview?selected_locale=${locale}`}
        ref={ref}
      />
    );
  }
);

export default memo(DescriptionBuilderEditModePreview);
