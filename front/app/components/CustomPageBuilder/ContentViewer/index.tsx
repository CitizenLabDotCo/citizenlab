import React from 'react';

import { Box, colors, Spinner } from '@citizenlab/cl2-component-library';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { normalizeCustomPageLayout } from 'components/CustomPageBuilder/defaultLayout';
import Editor from 'components/CustomPageBuilder/Editor';

import eventEmitter from 'utils/eventEmitter';

import useCustomPageBuilderContent from './useCustomPageBuilderContent';

type Props = {
  staticPageId: string;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

// Returns null when there is nothing to show, so the page falls back to its own sections.
const CustomPageContentViewer = ({ staticPageId }: Props) => {
  const { isLoading, hasContent, craftjsJson, layoutId } =
    useCustomPageBuilderContent(staticPageId);

  if (isLoading) return <Spinner />;
  if (!hasContent) return null;

  return (
    // The page container is grey and each legacy section paints white over it, so the
    // builder content has to do the same.
    <Box
      data-testid="customPageContentViewer"
      background={colors.white}
      py="50px"
    >
      <ContentBuilderLayoutProvider layoutId={layoutId}>
        <Editor isPreview={true}>
          <ContentBuilderFrame
            editorData={normalizeCustomPageLayout(craftjsJson)}
            onLoadImages={handleLoadImages}
          />
        </Editor>
      </ContentBuilderLayoutProvider>
    </Box>
  );
};

export default CustomPageContentViewer;
