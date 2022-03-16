import React from 'react';
import { Frame, Element } from '@craftjs/core';

const ContentBuilderPage = () => {
  return (
    <Frame>
      <Element
        is="div"
        canvas
        style={{ padding: '4px', minHeight: '300px', backgroundColor: '#fff' }}
      />
    </Frame>
  );
};

export default ContentBuilderPage;
