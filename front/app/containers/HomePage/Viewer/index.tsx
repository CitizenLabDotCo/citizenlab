import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import Editor from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Editor';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

import eventEmitter from 'utils/eventEmitter';

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const Preview = () => {
  const { data: homepageLayout } = useContentBuilderLayout('homepage');

  const homepageContent = homepageLayout?.data.attributes.craftjs_json;

  return (
    <Box>
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
