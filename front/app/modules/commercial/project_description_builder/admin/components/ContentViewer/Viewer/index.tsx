import React from 'react';

// hooks
import useProjectDescriptionBuilderLayout from 'modules/commercial/project_description_builder/api/useProjectDescriptionBuilderLayout';
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
import eventEmitter from 'utils/eventEmitter';

// constants
import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';

// typings
import { Multiloc } from 'typings';

type PreviewProps = {
  projectId: string;
  projectTitle: Multiloc;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const Preview = ({ projectId, projectTitle }: PreviewProps) => {
  const locale = useLocale();
  const localize = useLocalize();
  const { data: projectFiles } = useProjectFiles(projectId);

  const { data: projectDescriptionBuilderLayout, isInitialLoading } =
    useProjectDescriptionBuilderLayout(projectId);

  const projectDescriptionBuilderContent =
    projectDescriptionBuilderLayout &&
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
      {isInitialLoading && <Spinner />}
      {!isInitialLoading && projectDescriptionBuilderContent && (
        <Box data-testid="projectDescriptionBuilderPreviewContent">
          <Title color="tenantText" variant="h1">
            {localize(projectTitle)}
          </Title>
          <Editor isPreview={true}>
            <ContentBuilderFrame
              editorData={editorData}
              onLoadImages={handleLoadImages}
            />
          </Editor>
          {projectFiles && (
            <Box maxWidth="750px" mb="25px">
              <FileAttachments files={projectFiles.data} />
            </Box>
          )}
        </Box>
      )}
      {!isInitialLoading && !projectDescriptionBuilderContent && (
        <Box data-testid="projectDescriptionBuilderProjectDescription">
          <ProjectInfo projectId={projectId} />
        </Box>
      )}
    </Box>
  );
};

export default Preview;
