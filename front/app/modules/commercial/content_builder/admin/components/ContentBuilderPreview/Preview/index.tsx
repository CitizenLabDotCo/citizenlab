import React, { useEffect, useState } from 'react';

// hooks
import useContentBuilderLayout from '../../../../hooks/useContentBuilder';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

// components
import Editor from '../../Editor';
import ContentBuilderFrame from '../../ContentBuilderFrame';
import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';
import { isNilOrError } from 'utils/helperUtils';

// services
import { PROJECT_DESCRIPTION_CODE } from '../../../../services/contentBuilder';

// types
import { Multiloc } from 'typings';
import { SerializedNodes } from '@craftjs/core';

type PreviewProps = {
  projectId: string;
  projectTitle: Multiloc;
};

const Preview = ({ projectId, projectTitle }: PreviewProps) => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const locale = useLocale();
  const localize = useLocalize();

  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  useEffect(() => {
    window.addEventListener(
      'message',
      (e) => {
        if (e.origin === window.location.origin) {
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

  return (
    <Box data-testid="contentBuilderPreview">
      {loadingContentBuilderLayout && <Spinner />}
      {!loadingContentBuilderLayout && contentBuilderContent && (
        <Box data-testid="contentBuilderPreviewContent">
          <Title color="colorText" variant="h1">
            {localize(projectTitle)}
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
  );
};

export default Preview;
