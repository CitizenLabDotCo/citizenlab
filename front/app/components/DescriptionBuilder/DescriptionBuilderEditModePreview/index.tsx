import React, { memo } from 'react';

import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

type DescriptionBuilderPreviewProps = {
  contentBuildableId: string;
  selectedLocale?: SupportedLocale | null;
};

const DescriptionBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  DescriptionBuilderPreviewProps
>(({ contentBuildableId, selectedLocale }, ref) => {
  const platformLocale = useLocale();
  const locale = selectedLocale || platformLocale;

  return (
    <EditModePreview
      iframeSrc={`/${locale}/admin/description-builder/folders/${contentBuildableId}/preview?selected_locale=${locale}`}
      ref={ref}
    />
  );
});

export default memo(DescriptionBuilderEditModePreview);
