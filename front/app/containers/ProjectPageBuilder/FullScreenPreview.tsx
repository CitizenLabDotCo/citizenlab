import React, { useMemo, useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import useProjectPageLayout from 'api/content_builder/useProjectPageLayout';

import useLocale from 'hooks/useLocale';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { ensureLockedHeaderNodes } from 'components/ProjectPageBuilder/defaultLayout';
import Editor from 'components/ProjectPageBuilder/Editor';

import { isNilOrError } from 'utils/helperUtils';
import { useSearch } from 'utils/router';

type Props = {
  projectId: string;
};

// Renders only the layout: the page title is the layout's own Title widget,
// so adding a heading here would show it twice.
export const FullScreenPreview = ({ projectId }: Props) => {
  const search = useSearch({ strict: false });
  const selectedLocale = search.selected_locale || undefined;

  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();

  const { data: layout } = useProjectPageLayout(projectId);

  // The builder posts already-normalized draft data; the saved layout is
  // normalized here so stale layouts render with the current fixed structure.
  const savedEditorData = useMemo(
    () =>
      layout ? ensureLockedHeaderNodes(layout.data.attributes.craftjs_json) : undefined,
    [layout]
  );

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const isLoading = layout === undefined;
  const editorData = draftData || savedEditorData;

  return (
    <LanguageProvider
      platformLocale={platformLocale}
      contentBuilderLocale={selectedLocale}
    >
      <FullScreenWrapper onUpdateDraftData={setDraftData} padding="0px">
        {isLoading && <Spinner />}
        {!isLoading && editorData && (
          <Box>
            <Editor isPreview={true}>
              <ContentBuilderFrame editorData={editorData} />
            </Editor>
          </Box>
        )}
      </FullScreenWrapper>
    </LanguageProvider>
  );
};

export default FullScreenPreview;
