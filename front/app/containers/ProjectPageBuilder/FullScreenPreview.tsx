import React, { useState } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { Multiloc } from 'typings';

import useProjectPageLayout from 'api/content_builder/useProjectPageLayout';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import Editor from 'components/ProjectPageBuilder/Editor';

import { isNilOrError } from 'utils/helperUtils';
import { useSearch } from 'utils/router';

type Props = {
  projectId: string;
  titleMultiloc: Multiloc;
};

export const FullScreenPreview = ({ projectId, titleMultiloc }: Props) => {
  const search = useSearch({ strict: false });
  const selectedLocale = search.selected_locale || undefined;
  const localize = useLocalize();

  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();

  const { data: layout } = useProjectPageLayout(projectId);

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const isLoading = layout === undefined;
  const savedEditorData = layout?.data.attributes.craftjs_json;
  const editorData = draftData || savedEditorData;

  return (
    <LanguageProvider
      platformLocale={platformLocale}
      contentBuilderLocale={selectedLocale}
    >
      <FullScreenWrapper onUpdateDraftData={setDraftData} padding="0px">
        <Title color="tenantText" variant="h1" px="20px">
          {localize(titleMultiloc)}
        </Title>
        {isLoading && <Spinner />}
        {!isLoading && editorData && (
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
