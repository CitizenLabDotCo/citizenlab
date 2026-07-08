import { useMemo } from 'react';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';
import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

import { normalizeProjectPageLayout } from 'components/ProjectPageBuilder/defaultLayout';
import { extractDescriptionEditorData } from 'components/ProjectPageBuilder/descriptionSection';

const useProjectDescription = (
  projectId: string,
  { enabled = true, legacyEnabled = true } = {}
) => {
  const { data: pageLayout, isInitialLoading: pageLayoutLoading } =
    useProjectPageLayout(projectId, enabled);

  const { data: legacyLayout, isInitialLoading: legacyLayoutLoading } =
    useContentBuilderLayout(
      'project',
      projectId,
      enabled && legacyEnabled && !pageLayoutLoading && !pageLayout
    );

  const projectPageJson = useMemo(
    () =>
      pageLayout
        ? normalizeProjectPageLayout(pageLayout.data.attributes.craftjs_json)
        : undefined,
    [pageLayout]
  );

  const descriptionEditorData = useMemo(
    () => projectPageJson && extractDescriptionEditorData(projectPageJson),
    [projectPageJson]
  );

  return {
    isLoading: pageLayoutLoading || legacyLayoutLoading,
    pageLayout,
    projectPageJson,
    descriptionEditorData,
    legacyLayout,
  };
};

export default useProjectDescription;
