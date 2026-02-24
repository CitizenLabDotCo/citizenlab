import React, { useState } from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { useSearch } from 'utils/router';
import { Multiloc, SupportedLocale } from 'typings';

import { ContentBuildableType } from 'api/content_builder/types';
import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import Editor from 'components/DescriptionBuilder/Editor';

import { isNilOrError } from 'utils/helperUtils';

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
  const [search] = useSearch({ strict: false });
  const selectedLocale =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (search.get('selected_locale') as SupportedLocale) || undefined;
  const localize = useLocalize();

  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const platformLocale = useLocale();

  const { data: descriptionBuilderLayout } = useContentBuilderLayout(
    contentBuildableType,
    contentBuildableId
  );

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const isLoadingProjectDescriptionBuilderLayout =
    descriptionBuilderLayout === undefined;

  const savedEditorData = descriptionBuilderLayout?.data.attributes.craftjs_json
    ? // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      descriptionBuilderLayout?.data.attributes.craftjs_json
    : undefined;

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
