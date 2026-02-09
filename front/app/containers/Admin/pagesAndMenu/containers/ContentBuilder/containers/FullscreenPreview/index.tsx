import React, { useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { useSearchParams } from 'react-router-dom';
import { SupportedLocale } from 'typings';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useLocale from 'hooks/useLocale';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';

import { isNilOrError } from 'utils/helperUtils';

import Editor from '../../components/Editor';

export const FullScreenPreview = () => {
  const [search] = useSearchParams();
  const selectedLocale =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (search.get('selected_locale') as SupportedLocale) || undefined;
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();
  const { data: homepage, isLoading } = useContentBuilderLayout('homepage');

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const savedEditorData = homepage?.data.attributes.craftjs_json
    ? homepage.data.attributes.craftjs_json
    : undefined;

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
