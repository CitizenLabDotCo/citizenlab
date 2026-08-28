import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import {
  findNodeIdByName,
  normalizeCustomPageLayout,
} from 'components/CustomPageBuilder/defaultLayout';
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

  // A banner is full-bleed and belongs flush under the nav bar; anything else needs the
  // breathing room the legacy sections had.
  const hasBanner =
    !!craftjsJson &&
    findNodeIdByName(craftjsJson, 'CustomPageBanner') !== undefined;

  return (
    // The white behind this is the page's own, set by CustomPageShow when builder content
    // renders.
    <Box
      data-testid="customPageContentViewer"
      pt={hasBanner ? '0px' : '50px'}
      pb="50px"
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
