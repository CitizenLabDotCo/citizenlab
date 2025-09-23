import React, { useState } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { useParams, useSearchParams } from 'react-router-dom';
import { SupportedLocale } from 'typings';

import useProjectDescriptionBuilderLayout from 'api/project_description_builder/useProjectDescriptionBuilderLayout';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import Editor from 'components/ProjectDescriptionBuilder/Editor';

import { isNilOrError } from 'utils/helperUtils';

export const FullScreenPreview = () => {
  const [search] = useSearchParams();
  const selectedLocale =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (search.get('selected_locale') as SupportedLocale) || undefined;
  const localize = useLocalize();

  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const { folderId } = useParams() as { folderId: string };
  const platformLocale = useLocale();

  const { data: folder } = useProjectFolderById(folderId);
  const { data: projectDescriptionBuilderLayout } =
    useProjectDescriptionBuilderLayout(folderId, 'folder');

  if (isNilOrError(platformLocale) || !folder) {
    return null;
  }

  const isLoadingProjectDescriptionBuilderLayout =
    projectDescriptionBuilderLayout === undefined;

  const savedEditorData = projectDescriptionBuilderLayout?.data.attributes
    .craftjs_json
    ? // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      projectDescriptionBuilderLayout?.data.attributes.craftjs_json
    : undefined;

  const editorData = draftData || savedEditorData;

  return (
    <LanguageProvider
      platformLocale={platformLocale}
      contentBuilderLocale={selectedLocale}
    >
      <FullScreenWrapper onUpdateDraftData={setDraftData} padding="0px">
        <Title color="tenantText" variant="h1" px="20px">
          {localize(folder.data.attributes.title_multiloc)}
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
    </LanguageProvider>
  );
};

export default FullScreenPreview;
