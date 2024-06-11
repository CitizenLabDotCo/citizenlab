import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

type Props = {
  titleText: string | React.ReactNode;
};

const NewIdeaHeading = ({ titleText }: Props) => {
  return (
    <Box w="100%" display="flex" justifyContent="center">
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        maxWidth="700px"
      >
        <Text
          width="100%"
          color={'tenantPrimary'}
          variant="bodyL"
          style={{ fontWeight: 500 }}
          fontSize={'xxxxl'}
          m={'0px'}
        >
          {titleText}
        </Text>
      </Box>
    </Box>
  );
};

export default NewIdeaHeading;
