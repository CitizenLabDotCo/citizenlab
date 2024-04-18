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
        pt="40px"
      >
        <Box width="100%">
          <Text
            width="100%"
            color={'tenantPrimary'}
            variant="bodyL"
            style={{ fontWeight: 500 }}
            fontSize={'xxxxl'}
            ml={'0px'}
            my={'8px'}
          >
            {titleText}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default NewIdeaHeading;
