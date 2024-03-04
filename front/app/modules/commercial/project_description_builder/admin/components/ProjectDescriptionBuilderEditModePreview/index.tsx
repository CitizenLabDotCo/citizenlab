import React, { memo } from 'react';

import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

import useLocale from 'hooks/useLocale';
import { Locale } from 'typings';

type ProjectDescriptionBuilderPreviewProps = {
  projectId: string;
  selectedLocale?: Locale | null;
};

const ProjectDescriptionBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  ProjectDescriptionBuilderPreviewProps
>(({ projectId, selectedLocale }, ref) => {
  const platformLocale = useLocale();
  const locale = selectedLocale || platformLocale;

  return (
    <EditModePreview
      iframeSrc={`/${locale}/admin/project-description-builder/projects/${projectId}/preview?selected_locale=${locale}`}
      ref={ref}
    />
  );
});

export default memo(ProjectDescriptionBuilderEditModePreview);
