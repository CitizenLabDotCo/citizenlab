import React, { memo } from 'react';

import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

import { CUSTOM_PAGE_BUILDER_PATH } from 'components/admin/ContentBuilder/constants';
import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

type Props = {
  staticPageId: string;
  selectedLocale?: SupportedLocale | null;
};

const CustomPageBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  Props
>(({ staticPageId, selectedLocale }, ref) => {
  const platformLocale = useLocale();
  const locale = selectedLocale || platformLocale;

  return (
    <EditModePreview
      iframeSrc={`/${locale}/${CUSTOM_PAGE_BUILDER_PATH}/pages/${staticPageId}/preview?selected_locale=${locale}`}
      ref={ref}
    />
  );
});

export default memo(CustomPageBuilderEditModePreview);
