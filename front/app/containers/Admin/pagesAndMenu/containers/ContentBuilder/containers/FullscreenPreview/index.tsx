import React, { useState } from 'react';

// hooks
import useLocale from 'hooks/useLocale';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import Editor from '../../components/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// types
import { SerializedNodes } from '@craftjs/core';
import { useSearchParams } from 'react-router-dom';
import { Locale } from 'typings';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';

export const FullScreenPreview = () => {
  const [search] = useSearchParams();
  const selectedLocale = (search.get('selected_locale') as Locale) || undefined;
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();
  const { data: homepage, isLoading } = useHomepageLayout();

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const savedEditorData = homepage?.data.attributes.craftjs_json
    ? homepage?.data.attributes.craftjs_json
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
