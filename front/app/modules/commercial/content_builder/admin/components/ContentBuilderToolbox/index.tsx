import React from 'react';
import { useEditor, Element } from '@craftjs/core';

import CraftContainer from '../CraftContainer';

const ContentBuilderToolbox = () => {
  const { connectors } = useEditor();
  return (
    <button
      ref={(ref) =>
        ref && connectors.create(ref, <Element canvas is={CraftContainer} />)
      }
    >
      Container
    </button>
  );
};

export default ContentBuilderToolbox;
