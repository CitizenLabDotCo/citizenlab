import React from 'react';

import {
  Box,
  Table,
  Text,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ChangesTable = ({ changes }: { changes: Record<string, any> }) => {
  const { formatMessage } = useIntl();

  const keys = Object.keys(changes);

  return (
    <Table
      border={`1px solid ${colors.background}`}
      innerBorders={{
        headerCells: true,
        bodyCells: true,
        bodyRows: true,
      }}
    >
      <Thead>
        <Tr>
          <Th>{formatMessage(messages.key)}</Th>
          <Th>{formatMessage(messages.value)}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {keys.map((key, index) => {
          const value = changes[key];
          // When the value is multiloc, we display each language separately
          if (typeof value === 'object') {
            const valueKeys = Object.keys(value);

            return (
              <Tr key={index}>
                <Td>{key}</Td>
                <Td>
                  <Box maxWidth="280px" overflowY="auto">
                    {valueKeys.map((valueKey) => (
                      <Box key={valueKey}>
                        <Text fontWeight="bold" color="primary" fontSize="s">
                          {valueKey.toUpperCase()}:
                        </Text>
                        {/* When the value might be a project / folder / idea description, we display it as HTML */}
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: value[valueKey],
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Td>
              </Tr>
            );
          }

          return (
            <Tr key={index}>
              <Td>{key}</Td>
              <Td>
                <Text fontSize="s" wordBreak="break-word" color="primary">
                  {value}
                </Text>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default ChangesTable;
