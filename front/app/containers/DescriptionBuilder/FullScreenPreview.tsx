import React, { useState } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { useSearchParams } from 'react-router-dom';
import { Multiloc, SupportedLocale } from 'typings';

import { DescriptionModelType } from 'api/content_builder/types';
import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import Editor from 'components/DescriptionBuilder/Editor';

import { isNilOrError } from 'utils/helperUtils';

type Props = {
  modelId: string;
  modelType: DescriptionModelType;
  titleMultiloc: Multiloc;
};

export const FullScreenPreview = ({
  modelId,
  modelType,
  titleMultiloc,
}: Props) => {
  const [search] = useSearchParams();
  const selectedLocale =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (search.get('selected_locale') as SupportedLocale) || undefined;
  const localize = useLocalize();

  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();

  const { data: projectDescriptionBuilderLayout } = useContentBuilderLayout(
    modelId,
    modelType
  );

  if (isNilOrError(platformLocale)) {
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
          {localize(titleMultiloc)}
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
