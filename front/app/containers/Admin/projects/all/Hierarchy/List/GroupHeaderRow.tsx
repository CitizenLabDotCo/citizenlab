import React from 'react';

import { Td, Text, Tr, colors } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  count: number;
  colSpan: number;
}

// "Spaces 3": shown when a level has more than one group.
const GroupHeaderRow = ({ label, count, colSpan }: Props) => (
  <Tr background={colors.grey50}>
    <Td colSpan={colSpan} px="8px" py="8px">
      <Text as="span" m="0" variant="boControl" fontWeight="semi-bold">
        {label}
      </Text>
      <Text as="span" m="0" ml="8px" variant="boMicro" color="coolGrey500">
        {count}
      </Text>
    </Td>
  </Tr>
);

export default GroupHeaderRow;
