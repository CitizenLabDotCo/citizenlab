import React, { useState } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useLocale from 'hooks/useLocale';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import Editor from 'components/DescriptionBuilder/Editor';

import { isNilOrError } from 'utils/helperUtils';
import { useSearch } from 'utils/router';

type Props = {
  contentBuildableId: string;
};

export const FullScreenPreview = ({ contentBuildableId }: Props) => {
  const search = useSearch({ strict: false });
  const selectedLocale = search.selected_locale || undefined;
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();

  const { data: layout } = useContentBuilderLayout(
    'folder',
    contentBuildableId
  );

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const isLoadingLayout = layout === undefined;
  const editorData = draftData || layout?.data.attributes.craftjs_json;

  return (
    <LanguageProvider
      platformLocale={platformLocale}
      contentBuilderLocale={selectedLocale}
    >
      <FullScreenWrapper onUpdateDraftData={setDraftData} padding="0px">
        {isLoadingLayout && <Spinner />}
        {!isLoadingLayout && editorData && (
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
