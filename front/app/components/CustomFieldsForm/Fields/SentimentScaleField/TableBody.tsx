import React from 'react';

import {
  Box,
  Button,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';

const TableBody = () => {
  return (
    <Tbody>
      <Tr>
        {[...Array(maximum).keys()].map((index) => {
          return (
            <Th
              p="0px"
              maxWidth="20%"
              key={`${path}-radio-${index}`}
              scope="col"
              tabIndex={-1}
              pb="8px"
            >
              <Text
                textAlign="center"
                m="0px"
                px="4px"
                color="grey700"
                wordBreak="break-word"
                lineHeight="1.2"
              >
                {labelsFromSchema[index]}

                <ScreenReaderOnly>
                  {/* If there is not a label for this index, make sure that we still generate
                      a meaningful aria-label for screen readers.
                      */}
                  {!labelsFromSchema[index] && getAriaLabel(index + 1, maximum)}
                  {/* We use index + 1 because the index is 0-indexed, but the values are 1-indexed. */}
                </ScreenReaderOnly>
              </Text>
            </Th>
          );
        })}
      </Tr>
    </Tbody>
  );
};

export default TableBody;
