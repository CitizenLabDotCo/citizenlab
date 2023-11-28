import React, { memo } from 'react';

// craft
import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

// hooks
import useLocale from 'hooks/useLocale';
import { Locale } from 'typings';

const HomapageBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  {
    selectedLocale?: Locale | null;
  }
>(({ selectedLocale }, ref) => {
  const platformLocale = useLocale();
  const locale = selectedLocale || platformLocale;

  return (
    <EditModePreview
      iframeSrc={`/${platformLocale}/admin/pages-menu/homepage-builder/preview?selected_locale=${locale}`}
      ref={ref}
    />
  );
});

export default memo(HomapageBuilderEditModePreview);
