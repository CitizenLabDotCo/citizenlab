import React, { memo } from 'react';

import { useSearchParams } from 'react-router-dom';
import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

const HomapageBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  {
    selectedLocale?: SupportedLocale | null;
  }
>(({ selectedLocale }, ref) => {
  const [search] = useSearchParams();
  const platformLocale = useLocale();
  const locale = selectedLocale || platformLocale;

  const variant = search.get('variant');

  return (
    <EditModePreview
      iframeSrc={`/${platformLocale}/admin/pages-menu/homepage-builder/preview?selected_locale=${locale}&variant=${variant}`}
      ref={ref}
    />
  );
});

export default memo(HomapageBuilderEditModePreview);
