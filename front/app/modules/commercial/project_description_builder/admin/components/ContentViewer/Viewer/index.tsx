import React from 'react';

// hooks
import useProjectDescriptionBuilderLayout from 'modules/commercial/project_description_builder/hooks/useProjectDescriptionBuilderLayout';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
import useProjectFiles from 'api/project_files/useProjectFiles';

// components
import Editor from '../../Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';
import FileAttachments from 'components/UI/FileAttachments';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Multiloc } from 'typings';

type PreviewProps = {
  projectId: string;
  projectTitle: Multiloc;
};

const Preview = ({ projectId, projectTitle }: PreviewProps) => {
  const locale = useLocale();
  const localize = useLocalize();
  const { data: projectFiles } = useProjectFiles(projectId);

  const projectDescriptionBuilderLayout =
    useProjectDescriptionBuilderLayout(projectId);

  const isLoadingProjectDescriptionBuilderLayout =
    projectDescriptionBuilderLayout === undefined;

  const projectDescriptionBuilderContent =
    !isNilOrError(projectDescriptionBuilderLayout) &&
    !isNilOrError(locale) &&
    projectDescriptionBuilderLayout.data.attributes.enabled &&
    projectDescriptionBuilderLayout.data.attributes.craftjs_jsonmultiloc[
      locale
    ];

  const editorData =
    !isNilOrError(projectDescriptionBuilderLayout) && !isNilOrError(locale)
      ? projectDescriptionBuilderLayout.data.attributes.craftjs_jsonmultiloc[
          locale
        ]
      : undefined;

  return (
    <Box data-testid="projectDescriptionBuilderPreview">
      {isLoadingProjectDescriptionBuilderLayout && <Spinner />}
      {!isLoadingProjectDescriptionBuilderLayout &&
        projectDescriptionBuilderContent && (
          <Box data-testid="projectDescriptionBuilderPreviewContent">
            <Title color="tenantText" variant="h1">
              {localize(projectTitle)}
            </Title>
            <Editor isPreview={true}>
              <ContentBuilderFrame editorData={editorData} />
            </Editor>
            {projectFiles && (
              <Box maxWidth="750px" mb="25px">
                <FileAttachments files={projectFiles.data} />
              </Box>
            )}
          </Box>
        )}
      {!isLoadingProjectDescriptionBuilderLayout &&
        !projectDescriptionBuilderContent && (
          <Box data-testid="projectDescriptionBuilderProjectDescription">
            <ProjectInfo projectId={projectId} />
          </Box>
        )}
    </Box>
  );
};

export default Preview;
