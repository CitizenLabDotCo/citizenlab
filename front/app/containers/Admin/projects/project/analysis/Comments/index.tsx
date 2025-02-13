import React from 'react';

import { Accordion, Box, Icon, Title } from '@citizenlab/cl2-component-library';

const Comments = () => {
  return (
    <Accordion
      title={
        <Box display="flex" alignItems="center" px="24px" py="12px">
          <Icon height="16px" width="16px" name="comments" mr="8px" />
          <Title variant="h5" m="0">
            Comments
          </Title>
        </Box>
      }
    >
      <Box p="32px" h="300px">
        Test!
      </Box>
    </Accordion>
  );
};

export default Comments;
