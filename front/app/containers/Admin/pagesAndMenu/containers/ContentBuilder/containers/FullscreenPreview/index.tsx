import React, { useState } from 'react';

// hooks
import useProjectDescriptionBuilderLayout from 'modules/commercial/project_description_builder/api/useProjectDescriptionBuilderLayout';
import useLocale from 'hooks/useLocale';
import useProjectById from 'api/projects/useProjectById';
import { useParams } from 'react-router-dom';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import Editor from '../../components/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// types
import { SerializedNodes } from '@craftjs/core';

export const FullScreenPreview = () => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const [selectedLocale, setSelectedLocale] = useState<string | undefined>();
  const { projectId } = useParams() as { projectId: string };
  const platformLocale = useLocale();
  const { data: project } = useProjectById(projectId);

  const { data: projectDescriptionBuilderLayout } =
    useProjectDescriptionBuilderLayout(projectId);

  if (isNilOrError(platformLocale) || !project) {
    return null;
  }

  const locale = selectedLocale || platformLocale;
  const isLoadingProjectDescriptionBuilderLayout =
    projectDescriptionBuilderLayout === undefined;

  const savedEditorData = !isNilOrError(projectDescriptionBuilderLayout)
    ? projectDescriptionBuilderLayout.data.attributes.craftjs_jsonmultiloc[
        locale
      ]
    : undefined;

  const editorData = draftData || savedEditorData;

  return (
    <FullScreenWrapper
      onUpdateDraftData={setDraftData}
      onUpdateLocale={setSelectedLocale}
    >
      <Title color="tenantText" variant="h1">
        {project.data.attributes.title_multiloc[locale]}
      </Title>
      {isLoadingProjectDescriptionBuilderLayout && <Spinner />}
      {!isLoadingProjectDescriptionBuilderLayout && editorData && (
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
