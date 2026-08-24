import React, { useMemo, useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';

import useLocale from 'hooks/useLocale';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { normalizeCustomPageLayout } from 'components/CustomPageBuilder/defaultLayout';
import Editor from 'components/CustomPageBuilder/Editor';

import { useSearch } from 'utils/router';

type Props = {
  staticPageId: string;
};

export const FullScreenPreview = ({ staticPageId }: Props) => {
  const search = useSearch({ strict: false });
  const selectedLocale = search.selected_locale || undefined;

  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();

  const { data: layout } = useCustomPageLayout(staticPageId);

  const savedEditorData = useMemo(
    () =>
      layout
        ? normalizeCustomPageLayout(layout.data.attributes.craftjs_json)
        : undefined,
    [layout]
  );

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
          <Box ref={(el: HTMLElement | null) => el?.setAttribute('inert', '')}>
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
