import React, { memo } from 'react';

import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

type Props = {
  projectId: string;
  selectedLocale?: SupportedLocale | null;
};

const ProjectPageBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  Props
>(({ projectId, selectedLocale }, ref) => {
  const platformLocale = useLocale();
  const locale = selectedLocale || platformLocale;

  return (
    <EditModePreview
      iframeSrc={`/${locale}/admin/project-page-builder/projects/${projectId}/preview?selected_locale=${locale}&parallel_participation=true`}
      ref={ref}
    />
  );
});

export default memo(ProjectPageBuilderEditModePreview);
