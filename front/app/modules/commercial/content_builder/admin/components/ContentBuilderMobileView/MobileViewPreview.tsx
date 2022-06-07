import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// hooks
import useContentBuilderLayout from '../../../hooks/useContentBuilder';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
import useProject from 'hooks/useProject';

// components
import Editor from '../Editor';
import ContentBuilderFrame from '../ContentBuilderFrame';
import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';
import { isNilOrError } from 'utils/helperUtils';

// services
import { PROJECT_DESCRIPTION_CODE } from '../../../services/contentBuilder';

// types
import { SerializedNodes } from '@craftjs/core';
import { withRouter, WithRouterProps } from 'react-router';

const MobileViewPreview = ({ params: { projectId } }: WithRouterProps) => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const locale = useLocale();
  const localize = useLocalize();
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
      },
      false
    );
  }, []);

  const loadingContentBuilderLayout = contentBuilderLayout === undefined;

  const contentBuilderSavedContent =
    !isNilOrError(contentBuilderLayout) &&
    !isNilOrError(locale) &&
    contentBuilderLayout.data.attributes.enabled &&
    contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale];

  const contentBuilderContent = draftData || contentBuilderSavedContent;

  const savedEditorData =
    !isNilOrError(contentBuilderLayout) && !isNilOrError(locale)
      ? contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale]
      : undefined;

  const editorData = draftData || savedEditorData;

  return modalPortalElement && !isNilOrError(project)
    ? createPortal(
        <Box
          display="flex"
          flexDirection="column"
          w="100%"
          zIndex="10000"
          position="fixed"
          h="100vh"
          bgColor="#fff"
          p="20px"
        >
          <FocusOn>
            <Box data-testid="contentBuilderPreview">
              {loadingContentBuilderLayout && <Spinner />}
              {!loadingContentBuilderLayout && contentBuilderContent && (
                <Box data-testid="contentBuilderPreviewContent">
                  <Title color="colorText" variant="h1">
                    {localize(project.attributes.title_multiloc)}
                  </Title>
                  <Editor isPreview={true}>
                    <ContentBuilderFrame editorData={editorData} />
                  </Editor>
                </Box>
              )}
              {!loadingContentBuilderLayout && !contentBuilderContent && (
                <Box data-testid="contentBuilderProjectDescription">
                  <ProjectInfo projectId={projectId} />
                </Box>
              )}
            </Box>
          </FocusOn>
        </Box>,
        modalPortalElement
      )
    : null;
};

export default withRouter(MobileViewPreview);
