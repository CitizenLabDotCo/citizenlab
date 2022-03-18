import React from 'react';
import { Frame, Element } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

const ContentBuilderPage = () => {
  return (
    <Box paddingTop="100px">
      <div className="page-container">
        <Frame>
          <Element
            is="div"
            canvas
            style={{
              padding: '4px',
              minHeight: '300px',
              backgroundColor: '#fff',
            }}
          />
        </Frame>
      </div>
    </Box>
  );
};

export default ContentBuilderPage;
