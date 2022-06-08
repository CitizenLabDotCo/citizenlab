import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// hooks
import useContentBuilderLayout from '../../../hooks/useContentBuilder';
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';

// components
import Editor from '../Editor';
import ContentBuilderFrame from '../ContentBuilderFrame';
import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// services
import { PROJECT_DESCRIPTION_CODE } from '../../../services/contentBuilder';

// types
import { SerializedNodes } from '@craftjs/core';
import { withRouter, WithRouterProps } from 'react-router';

const MobileViewPreview = ({ params: { projectId } }: WithRouterProps) => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const [selectedLocale, setSelectedLocale] = useState<string | undefined>();
  const platformLocale = useLocale();
  const project = useProject({ projectId });

  const modalPortalElement = document.getElementById('modal-portal');
  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  useEffect(() => {
    window.addEventListener(
      'message',
      (e) => {
        // Make sure there is a root node in the draft data
        if (e.origin === window.location.origin && e.data.ROOT) {
          setDraftData(e.data);
        }
        if (e.origin === window.location.origin && e.data.selectedLocale) {
          setSelectedLocale(e.data.selectedLocale);
        }
      },
      false
    );
  }, []);

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const locale = selectedLocale || platformLocale;
  const loadingContentBuilderLayout = contentBuilderLayout === undefined;

  const contentBuilderSavedContent =
    !isNilOrError(contentBuilderLayout) &&
    contentBuilderLayout.data.attributes.enabled &&
    contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale];

  const contentBuilderContent = draftData || contentBuilderSavedContent;

  const savedEditorData = !isNilOrError(contentBuilderLayout)
    ? contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale]
    : undefined;

  const editorData = draftData || savedEditorData;

  return modalPortalElement && !isNilOrError(project)
    ? createPortal(
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
          >
            <Box p="20px">
              <Title color="colorText" variant="h1">
                {project.attributes.title_multiloc[locale]}
              </Title>
              {loadingContentBuilderLayout && <Spinner />}
              {!loadingContentBuilderLayout && contentBuilderContent && (
                <Box>
                  <Editor isPreview={true}>
                    <ContentBuilderFrame editorData={editorData} />
                  </Editor>
                </Box>
              )}
            </Box>
          </Box>
        </FocusOn>,
        modalPortalElement
      )
    : null;
};

export default withRouter(MobileViewPreview);
