import React, { useCallback, useMemo, useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { useQueryClient } from '@tanstack/react-query';

import fileAttachmentsKeys from 'api/file_attachments/keys';
import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

import useLocale from 'hooks/useLocale';

import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { normalizeProjectPageLayout } from 'components/ProjectPageBuilder/defaultLayout';
import Editor from 'components/ProjectPageBuilder/Editor';

import { isNilOrError } from 'utils/helperUtils';
import { useSearch } from 'utils/router';

type Props = {
  projectId: string;
};

export const FullScreenPreview = ({ projectId }: Props) => {
  const search = useSearch({ strict: false });
  const selectedLocale = search.selected_locale || undefined;

  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();

  const queryClient = useQueryClient();
  const { data: layout } = useProjectPageLayout(projectId);

  // The save creates the layout's file attachments, and this document caches its own copy.
  const handleSave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: fileAttachmentsKeys.lists() });
  }, [queryClient]);

  const savedEditorData = useMemo(
    () =>
      layout
        ? normalizeProjectPageLayout(layout.data.attributes.craftjs_json)
        : undefined,
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
      <FullScreenWrapper
        onUpdateDraftData={setDraftData}
        onSave={handleSave}
        padding="0px"
      >
        {isLoading && <Spinner />}
        {!isLoading && editorData && (
          <Box ref={(el: HTMLElement | null) => el?.setAttribute('inert', '')}>
            <ContentBuilderLayoutProvider layoutId={layout.data.id}>
              <Editor isPreview={true}>
                <ContentBuilderFrame editorData={editorData} />
              </Editor>
            </ContentBuilderLayoutProvider>
          </Box>
        )}
      </FullScreenWrapper>
    </LanguageProvider>
  );
};

export default FullScreenPreview;
