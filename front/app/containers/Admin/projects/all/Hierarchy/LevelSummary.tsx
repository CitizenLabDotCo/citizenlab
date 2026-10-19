import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

interface Props {
  text: string;
}

// How many projects a level shows, above them.
const LevelSummary = ({ text }: Props) => (
  <Text variant="boMicro" m="0" mb="8px">
    {text}
  </Text>
);

export default LevelSummary;
