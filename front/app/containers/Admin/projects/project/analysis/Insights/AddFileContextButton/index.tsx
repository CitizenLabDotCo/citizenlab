import React, { useState } from 'react';

import { Box, Button, IconTooltip } from '@citizenlab/cl2-component-library';

const AddFileContext = () => {
  const [showFileUploader, setShowFileUploader] = useState(false);

  return (
    <Box display="flex" alignItems="center" gap="4px">
      <IconTooltip
        mb="4px"
        content="Attach a file to provide additional context to the AI."
        iconSize="16px"
      />

      <Button
        icon="plus"
        iconPos="right"
        text="Attach file"
        buttonStyle="text"
        iconSize="20px"
        pl="0px"
        fontSize="s"
      />
    </Box>
  );
};

export default AddFileContext;
