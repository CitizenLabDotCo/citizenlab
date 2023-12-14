import React from 'react';

// hooks

// components
import Editor from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { Box } from '@citizenlab/cl2-component-library';

// utils
import eventEmitter from 'utils/eventEmitter';

// constants
import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const Preview = () => {
  const { data: homepageLayout } = useHomepageLayout();

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
