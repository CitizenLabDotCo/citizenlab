import React, { useMemo, useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';

import useLocale from 'hooks/useLocale';

import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { useSectionBoundaryMargin } from 'components/admin/ContentBuilder/verticalRhythm';
import {
  layoutHasBanner,
  normalizeCustomPageLayout,
} from 'components/CustomPageBuilder/defaultLayout';
import Editor from 'components/CustomPageBuilder/Editor';

import { useSearch } from 'utils/router';

type Props = {
  staticPageId: string;
};

const FullScreenPreview = ({ staticPageId }: Props) => {
  const search = useSearch({ strict: false });
  const selectedLocale = search.selected_locale || undefined;

  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();
  // Matches CustomPageContentViewer, so the preview shows the page's real top gap.
  const paddingTop = useSectionBoundaryMargin();

  const { data: layout, isLoading } = useCustomPageLayout(staticPageId);

  const savedEditorData = useMemo(
    () =>
      layout
        ? normalizeCustomPageLayout(layout.data.attributes.craftjs_json)
        : undefined,
    [layout]
  );

  const editorData = draftData || savedEditorData;

  return (
    <LanguageProvider
      platformLocale={platformLocale}
      contentBuilderLocale={selectedLocale}
    >
      <FullScreenWrapper onUpdateDraftData={setDraftData} padding="0px">
        {isLoading && <Spinner />}
        {!isLoading && editorData && (
          <Box
            ref={(el: HTMLElement | null) => el?.setAttribute('inert', '')}
            pt={layoutHasBanner(editorData) ? undefined : paddingTop}
          >
            <ContentBuilderLayoutProvider layoutId={layout?.data.id}>
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
