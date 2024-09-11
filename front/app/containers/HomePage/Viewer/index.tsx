import React from 'react';

import { Box, useWindowSize } from '@citizenlab/cl2-component-library';
import { Player } from '@remotion/player';

import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';

import Editor from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Editor';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { MyComposition } from 'components/remotion/Composition';

import eventEmitter from 'utils/eventEmitter';

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const Preview = () => {
  const { data: homepageLayout } = useHomepageLayout();
  const windowSize = useWindowSize();
  const homepageContent = homepageLayout?.data.attributes.craftjs_json;

  return (
    <Box>
      <Player
        component={MyComposition}
        inputProps={{ text: 'World' }}
        durationInFrames={160}
        compositionWidth={windowSize.windowWidth}
        compositionHeight={600}
        fps={30}
        style={{
          width: windowSize.windowWidth,
          height: 600,
        }}
        controls={false}
        // controls={true}
        autoPlay={true}
        loop={true}
      />

      <Editor isPreview={true}>
        <ContentBuilderFrame
          editorData={homepageContent}
          onLoadImages={handleLoadImages}
        />
      </Editor>
    </Box>
  );
};

export default Preview;
