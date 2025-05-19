import React from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';

const Labels = () => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      width="100%"
      display={isSmallerThanPhone ? 'block' : 'flex'}
      justifyContent="space-between"
    >
      {hasOnlyMinOrMaxLabels && !isSmallerThanPhone ? ( // For desktop view when only min and/or max labels are present
        <>
          <Box maxWidth={'50%'}>
            <Text mt="8px" mb="0px" color="textSecondary">
              {labelsFromSchema[0]}
            </Text>
          </Box>
          <Box maxWidth={'50%'}>
            <Text mt={'8px'} m="0px" color="textSecondary">
              {labelsFromSchema[labelsFromSchema.length - 1]}
            </Text>
          </Box>
        </>
      ) : (
        // Show labels as list underneath the buttons when more than 3 labels OR on mobile devices
        <Box maxWidth={'100%'}>
          {labelsFromSchema.map((label, index) => (
            <Box display="flex" key={`${path}-${index}`}>
              {label && (
                <>
                  <Text
                    mt="8px"
                    mb="0px"
                    mr="8px"
                    color="textSecondary"
                    style={{ textAlign: 'center' }}
                  >
                    {`${index + 1}.`}
                  </Text>
                  <Text
                    mt="8px"
                    mb="0px"
                    color="textSecondary"
                    style={{ textAlign: 'center' }}
                  >
                    {label}
                  </Text>
                </>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Labels;
