import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import StickyNotesPile from './StickyNotesPile';

const IdeasInProjectShowPage = () => {
  return (
    <Box>
      <StickyNotesPile queryParameters={{}} maxNotes={25} />
    </Box>
  );
};

export default IdeasInProjectShowPage;
