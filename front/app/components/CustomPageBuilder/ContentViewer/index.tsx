import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { useSectionBoundaryMargin } from 'components/admin/ContentBuilder/verticalRhythm';
import {
  layoutHasBanner,
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

const CustomPageContentViewer = ({ staticPageId }: Props) => {
  const { isLoading, hasContent, craftjsJson, layoutId } =
    useCustomPageBuilderContent(staticPageId);
  // The rhythm spaces widgets against each other, so the gap under the nav bar is the
  // page's to set — unless a banner sits there, full bleed. FullScreenPreview applies the
  // same rule, or the preview reads tighter than the page.
  const paddingTop = useSectionBoundaryMargin();

  if (isLoading) return <Spinner />;
  if (!hasContent) return null;

  return (
    <Box
      data-testid="customPageContentViewer"
      pt={layoutHasBanner(craftjsJson) ? undefined : paddingTop}
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
