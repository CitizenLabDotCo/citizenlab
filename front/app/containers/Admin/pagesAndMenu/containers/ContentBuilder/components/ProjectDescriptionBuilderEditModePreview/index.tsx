import React, { memo } from 'react';

// craft
import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

// hooks
import useLocale from 'hooks/useLocale';

const ProjectDescriptionBuilderEditModePreview =
  React.forwardRef<HTMLIFrameElement>((_, ref) => {
    const locale = useLocale();

    return (
      <EditModePreview
        iframeSrc={`/${locale}/admin/pages-menu/homepage/content-builder/preview`}
        ref={ref}
      />
    );
  });

export default memo(ProjectDescriptionBuilderEditModePreview);
