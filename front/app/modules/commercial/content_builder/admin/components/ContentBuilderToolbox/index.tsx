import React from 'react';
import { useEditor, Element } from '@craftjs/core';

import Container from '../Container';

const ContentBuilderToolbox = () => {
  const { connectors } = useEditor();
  return (
    <button
      ref={(ref) =>
        ref &&
        connectors.create(ref, <Element canvas is={Container} id="container" />)
      }
    >
      1 column
    </button>
  );
};

export default ContentBuilderToolbox;
