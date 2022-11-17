import React, { memo } from 'react';

// craft
import EditModePreview from 'components/ContentBuilder/EditModePreview';

// hooks
import useLocale from 'hooks/useLocale';

type ContentBuilderPreviewProps = {
  projectId: string;
};

const ContentBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  ContentBuilderPreviewProps
>(({ projectId }, ref) => {
  const locale = useLocale();

  return (
    <EditModePreview
      iframeSrc={`/${locale}/admin/content-builder/projects/${projectId}/preview`}
      ref={ref}
    />
  );
});

export default memo(ContentBuilderEditModePreview);
