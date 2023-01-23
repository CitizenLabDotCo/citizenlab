import React, { useState } from 'react';

// hooks
import useContentBuilderLayout from '../../../hooks/useContentBuilder';
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import { useParams } from 'react-router-dom';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import Editor from '../../components/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// services
import { PROJECT_DESCRIPTION_CODE } from '../../../services/contentBuilder';

// types
import { SerializedNodes } from '@craftjs/core';

export const FullScreenPreview = () => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const [selectedLocale, setSelectedLocale] = useState<string | undefined>();
  const { projectId } = useParams() as { projectId: string };
  const platformLocale = useLocale();
  const project = useProject({ projectId });

  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  if (isNilOrError(platformLocale) || isNilOrError(project)) {
    return null;
  }

  const locale = selectedLocale || platformLocale;
  const isLoadingContentBuilderLayout = contentBuilderLayout === undefined;

  const savedEditorData = !isNilOrError(contentBuilderLayout)
    ? contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale]
    : undefined;

  const editorData = draftData || savedEditorData;

  return (
    <FullScreenWrapper
      onUpdateDraftData={setDraftData}
      onUpdateLocale={setSelectedLocale}
    >
      <Title color="tenantText" variant="h1">
        {project.attributes.title_multiloc[locale]}
      </Title>
      {isLoadingContentBuilderLayout && <Spinner />}
      {!isLoadingContentBuilderLayout && editorData && (
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
