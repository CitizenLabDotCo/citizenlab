import React from 'react';

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
import useProjectFiles from 'hooks/useProjectFiles';
import FileAttachments from 'components/UI/FileAttachments';

type PreviewProps = {
  projectId: string;
  projectTitle: Multiloc;
};

const Preview = ({ projectId, projectTitle }: PreviewProps) => {
  const locale = useLocale();
  const localize = useLocalize();
  // Will have to be abstracted out
  const projectFiles = useProjectFiles(projectId);

  // Will have to be abstracted out
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
