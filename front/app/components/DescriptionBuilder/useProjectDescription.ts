import { useMemo } from 'react';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';
import useProjectPageLayout from 'api/content_builder/useProjectPageLayout';

import { ensureLockedHeaderNodes } from 'components/ProjectPageBuilder/defaultLayout';
import { extractDescriptionEditorData } from 'components/ProjectPageBuilder/descriptionSection';

// Resolves where a project's description lives. The single source of truth is
// the project_page layout's description section; projects not yet migrated fall
// back to their legacy project_description layout. Once a project_page layout
// exists, the legacy layout is frozen and never read again — its section is the
// description, even when empty.
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

  // The full normalized project_page layout — the splice target when saving
  // description edits back into it.
  const projectPageJson = useMemo(
    () =>
      pageLayout
        ? ensureLockedHeaderNodes(pageLayout.data.attributes.craftjs_json)
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
