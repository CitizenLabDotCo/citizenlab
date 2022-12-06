import React from 'react';
// types
import { Multiloc } from 'typings';
import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
// hooks
import useContentBuilderLayout from '../../../../hooks/useContentBuilder';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
import useProjectFiles from 'hooks/useProjectFiles';
// services
import { PROJECT_DESCRIPTION_CODE } from '../../../../services/contentBuilder';
import { isNilOrError } from 'utils/helperUtils';
import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';
import FileAttachments from 'components/UI/FileAttachments';
import ContentBuilderFrame from '../../ContentBuilderFrame';
// components
import Editor from '../../Editor';

type PreviewProps = {
  projectId: string;
  projectTitle: Multiloc;
};

const Preview = ({ projectId, projectTitle }: PreviewProps) => {
  const locale = useLocale();
  const localize = useLocalize();
  const projectFiles = useProjectFiles(projectId);

  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  const isLoadingContentBuilderLayout = contentBuilderLayout === undefined;

  const contentBuilderContent =
    !isNilOrError(contentBuilderLayout) &&
    !isNilOrError(locale) &&
    contentBuilderLayout.data.attributes.enabled &&
    contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale];

  const editorData =
    !isNilOrError(contentBuilderLayout) && !isNilOrError(locale)
      ? contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale]
      : undefined;

  return (
    <Box data-testid="contentBuilderPreview">
      {isLoadingContentBuilderLayout && <Spinner />}
      {!isLoadingContentBuilderLayout && contentBuilderContent && (
        <Box data-testid="contentBuilderPreviewContent">
          <Title color="tenantText" variant="h1">
            {localize(projectTitle)}
          </Title>
          <Editor isPreview={true}>
            <ContentBuilderFrame editorData={editorData} />
          </Editor>
          {!isNilOrError(projectFiles) && (
            <Box maxWidth="750px">
              <FileAttachments files={projectFiles.data} />
            </Box>
          )}
        </Box>
      )}
      {!isLoadingContentBuilderLayout && !contentBuilderContent && (
        <Box data-testid="contentBuilderProjectDescription">
          <ProjectInfo projectId={projectId} />
        </Box>
      )}
    </Box>
  );
};

export default Preview;
