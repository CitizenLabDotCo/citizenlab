import React, { memo } from 'react';

import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

type ProjectDescriptionBuilderPreviewProps = {
  projectId: string;
  selectedLocale?: SupportedLocale | null;
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
