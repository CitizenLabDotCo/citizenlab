import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

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

const CustomPageContentViewer = ({ staticPageId }: Props) => {
  const { isLoading, hasContent, craftjsJson, layoutId } =
    useCustomPageBuilderContent(staticPageId);

  if (isLoading) return <Spinner />;
  if (!hasContent) return null;

  return (
    // Matches the vertical breathing room the legacy sections had. The white behind it is the
    // page's own, set by CustomPageShow when builder content renders.
    <Box data-testid="customPageContentViewer" py="50px">
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
