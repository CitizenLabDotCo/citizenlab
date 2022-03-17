import React from 'react';
import { Frame, Element } from '@craftjs/core';

const ContentBuilderPage = () => {
  return (
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
  );
};

export default ContentBuilderPage;
