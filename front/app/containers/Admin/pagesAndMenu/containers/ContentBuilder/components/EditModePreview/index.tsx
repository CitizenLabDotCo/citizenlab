import React, { memo } from 'react';

import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

import { useSearch } from 'utils/router';

const HomapageBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  {
    selectedLocale?: SupportedLocale | null;
  }
>(({ selectedLocale }, ref) => {
  const search = useSearch({
    from: '/$locale/admin/pages-menu/homepage-builder',
  });
  const platformLocale = useLocale();
  const locale = selectedLocale || platformLocale;

  const variant = search.variant;

  return (
    <EditModePreview
      iframeSrc={`/${platformLocale}/admin/pages-menu/homepage-builder/preview?selected_locale=${locale}&variant=${variant}`}
      ref={ref}
    />
  );
});

export default memo(HomapageBuilderEditModePreview);
