import React from 'react';
import { useEditor, Element } from '@craftjs/core';

import ContentBuilderOneColumn from '../ContentBuilderOneColumn';

const ContentBuilderToolbox = () => {
  const { connectors } = useEditor();
  return (
    <button
      ref={(ref) =>
        ref &&
        connectors.create(ref, <Element canvas is={ContentBuilderOneColumn} />)
      }
    >
      Container
    </button>
  );
};

export default ContentBuilderToolbox;
