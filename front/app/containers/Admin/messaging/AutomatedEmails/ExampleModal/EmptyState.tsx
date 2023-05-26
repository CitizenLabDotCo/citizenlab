import React from 'react';
import { Box, Button, Text } from '@citizenlab/cl2-component-library';

const EmptyState = () => {
  return (
    <div>
      <Text>
        We can’t show you an example email as none of this type has been sent
        yet. As soon as one is sent you’ll be able to view it here.
      </Text>
      <Text>
        Click on the button below to check some email examples on our support
        page.
      </Text>
      <Box display="flex" justifyContent="center" mt="32px">
        <Button>See examples on our support page</Button>
      </Box>
    </div>
  );
};

export default EmptyState;
