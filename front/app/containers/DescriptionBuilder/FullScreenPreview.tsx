import React, { useState } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { Multiloc } from 'typings';

import { ContentBuildableType } from 'api/content_builder/types';
import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import Editor from 'components/DescriptionBuilder/Editor';
import useProjectDescription from 'components/DescriptionBuilder/useProjectDescription';

import { isNilOrError } from 'utils/helperUtils';
import { useSearch } from 'utils/router';

type Props = {
  contentBuildableId: string;
  contentBuildableType: ContentBuildableType;
  titleMultiloc: Multiloc;
};

export const FullScreenPreview = ({
  contentBuildableId,
  contentBuildableType,
  titleMultiloc,
}: Props) => {
  const search = useSearch({ strict: false });
  const selectedLocale = search.selected_locale || undefined;
  const localize = useLocalize();
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();
  const isProject = contentBuildableType === 'project';

  const { pageLayout, descriptionEditorData, legacyLayout } =
    useProjectDescription(contentBuildableId, { enabled: isProject });
  const { data: folderLayout } = useContentBuilderLayout(
    contentBuildableType,
    contentBuildableId,
    !isProject
  );

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const savedLayout = isProject ? pageLayout ?? legacyLayout : folderLayout;
  const isLoadingLayout = savedLayout === undefined;

  const savedEditorData =
    isProject && pageLayout
      ? descriptionEditorData
      : savedLayout?.data.attributes.craftjs_json || undefined;

  const editorData = draftData || savedEditorData;

  return (
    <LanguageProvider
      platformLocale={platformLocale}
      contentBuilderLocale={selectedLocale}
    >
      <FullScreenWrapper onUpdateDraftData={setDraftData} padding="0px">
        {contentBuildableType === 'project' && (
          <Title color="tenantText" variant="h1" px="20px">
            {localize(titleMultiloc)}
          </Title>
        )}
        {isLoadingLayout && <Spinner />}
        {!isLoadingLayout && editorData && (
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
