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
import useHomepageSettings from 'api/home_page/useHomepageSettings';

export const FullScreenPreview = () => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();

  const platformLocale = useLocale();
  const { data: homepage, isLoading } = useHomepageSettings();

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const savedEditorData = homepage?.data.attributes.craftjs_json
    ? homepage?.data.attributes.craftjs_json
    : undefined;

  const editorData = draftData || savedEditorData;

  return (
    <FullScreenWrapper onUpdateDraftData={setDraftData}>
      {isLoading && <Spinner />}
      {!isLoading && editorData && (
        <Box>
          <Editor isPreview={true}>
            <ContentBuilderFrame editorData={editorData} />
          </Editor>
        </Box>
      )}
    </FullScreenWrapper>
  );
};

export default FullScreenPreview;
