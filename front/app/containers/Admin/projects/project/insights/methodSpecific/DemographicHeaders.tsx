import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  demographicKeys: string[];
  getDemographicLabel: (key: string) => string;
}

const DemographicHeaders = ({
  demographicKeys,
  getDemographicLabel,
}: Props) => {
  if (demographicKeys.length === 0) return null;

  return (
    <Box display="flex" gap="8px" mb="12px">
      <Box width="60%" flexShrink={0} />
      <Box display="flex" gap="8px" flex="1">
        {demographicKeys.map((key) => (
          <Box key={key} width="150px" flexShrink={0}>
            <Text
              fontSize="xs"
              color="grey700"
              fontWeight="bold"
              textAlign="center"
              my="0px"
            >
              {getDemographicLabel(key)}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DemographicHeaders;
