import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// hooks
import useContentBuilderLayout from '../../../hooks/useContentBuilder';
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import { useParams } from 'react-router-dom';

// components
import Editor from '../Editor';
import ContentBuilderFrame from '../ContentBuilderFrame';
import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// services
import { PROJECT_DESCRIPTION_CODE } from '../../../services/contentBuilder';

// types
import { SerializedNodes } from '@craftjs/core';

export const EditModePreview = () => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const [selectedLocale, setSelectedLocale] = useState<string | undefined>();
  const { projectId } = useParams() as { projectId: string };
  const platformLocale = useLocale();
  const project = useProject({ projectId });

  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Make sure there is a root node in the draft data
      if (e.origin === window.location.origin && e.data.ROOT) {
        setDraftData(e.data);
      }
      if (e.origin === window.location.origin && e.data.selectedLocale) {
        setSelectedLocale(e.data.selectedLocale);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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
    <FocusOn>
      <Box
        display="flex"
        flexDirection="column"
        w="100%"
        zIndex="10000"
        position="fixed"
        height="100vh"
        bgColor="#fff"
        overflowY="auto"
        data-testid="contentBuilderEditModePreviewContent"
      >
        <Box p="20px">
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
        </Box>
      </Box>
    </FocusOn>
  );
};

const EditModePreviewModal = () => {
  const modalPortalElement = document.getElementById('modal-portal');

  return modalPortalElement
    ? createPortal(<EditModePreview />, modalPortalElement)
    : null;
};
export default EditModePreviewModal;
