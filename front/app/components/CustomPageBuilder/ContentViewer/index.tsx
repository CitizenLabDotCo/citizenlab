import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
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

// Renders a custom page from its Content Builder layout. Returns null when there is nothing
// to show, so the page falls back to its legacy sections — which is the normal case for any
// page whose layout has not been created yet.
const CustomPageContentViewer = ({ staticPageId }: Props) => {
  const { isLoading, hasContent, craftjsJson } =
    useCustomPageBuilderContent(staticPageId);

  if (isLoading) return <Spinner />;
  if (!hasContent) return null;

  return (
    <Box data-testid="customPageContentViewer">
      <Editor isPreview={true}>
        <ContentBuilderFrame
          editorData={normalizeCustomPageLayout(craftjsJson)}
          onLoadImages={handleLoadImages}
        />
      </Editor>
    </Box>
  );
};

export default CustomPageContentViewer;
