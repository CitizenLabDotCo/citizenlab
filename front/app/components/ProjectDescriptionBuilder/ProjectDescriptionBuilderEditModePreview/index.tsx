import React, { memo } from 'react';

import { SupportedLocale } from 'typings';

import { ProjectDescriptionModelType } from 'api/project_description_builder/types';

import useLocale from 'hooks/useLocale';

import EditModePreview from 'components/admin/ContentBuilder/EditModePreview';

type ProjectDescriptionBuilderPreviewProps = {
  modelId: string;
  modelType?: ProjectDescriptionModelType;
  selectedLocale?: SupportedLocale | null;
};

const ProjectDescriptionBuilderEditModePreview = React.forwardRef<
  HTMLIFrameElement,
  ProjectDescriptionBuilderPreviewProps
>(({ modelId, modelType = 'project', selectedLocale }, ref) => {
  const platformLocale = useLocale();
  const locale = selectedLocale || platformLocale;

  return (
    <EditModePreview
      iframeSrc={`/${locale}/admin/project-description-builder/${modelType}s/${modelId}/preview?selected_locale=${locale}`}
      ref={ref}
    />
  );
});

export default memo(ProjectDescriptionBuilderEditModePreview);
