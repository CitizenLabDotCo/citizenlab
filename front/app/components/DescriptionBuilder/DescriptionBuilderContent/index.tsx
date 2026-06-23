import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNode } from '@craftjs/core';
import { SupportedLocale } from 'typings';

import ContentBuilderCanvas from 'components/admin/ContentBuilder/Canvas';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';

const CONTENT_MAX_WIDTH = '1000px';

type Props = {
  selectedLocale: SupportedLocale;
  platformLocale: SupportedLocale;
  editorData?: Record<string, SerializedNode>;
};

const DescriptionBuilderContent = ({
  selectedLocale,
  platformLocale,
  editorData,
}: Props) => {
  return (
    <LanguageProvider
      contentBuilderLocale={selectedLocale}
      platformLocale={platformLocale}
    >
      <ContentBuilderCanvas>
        <Box width="100%" maxWidth={CONTENT_MAX_WIDTH}>
          <ContentBuilderFrame editorData={editorData} />
        </Box>
      </ContentBuilderCanvas>
    </LanguageProvider>
  );
};

export default DescriptionBuilderContent;
