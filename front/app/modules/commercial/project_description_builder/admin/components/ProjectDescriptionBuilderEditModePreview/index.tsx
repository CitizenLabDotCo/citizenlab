import React, { memo } from 'react';

// craft
import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

// hooks
import useLocale from 'hooks/useLocale';

type ProjectDescriptionBuilderPreviewProps = {
  projectId: string;
};

const ProjectDescriptionBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  ProjectDescriptionBuilderPreviewProps
>(({ projectId }, ref) => {
  const locale = useLocale();

  return (
    <EditModePreview
      iframeSrc={`/${locale}/admin/project-description-builder/projects/${projectId}/preview`}
      ref={ref}
    />
  );
});

export default memo(ProjectDescriptionBuilderEditModePreview);
