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
  Title,
} from '@citizenlab/cl2-component-library';
import { isObject } from 'react-jsonschema-form/lib/utils';

const ChangesTable = ({ changes }: { changes: Record<string, any> | null }) => {
  if (!changes) {
    return null;
  }
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
          <Th>Key</Th>
          <Th>Value</Th>
        </Tr>
      </Thead>
      <Tbody>
        {keys.map((key, index) => {
          const value = changes[key];
          if (isObject(value)) {
            const valueKeys = Object.keys(value);

            return (
              <Tr key={index}>
                <Td>{key}</Td>
                <Td>
                  {valueKeys.map((valueKey) => (
                    <Box key={valueKey}>
                      <Text fontWeight="bold" color="primary" fontSize="s">
                        {valueKey.toUpperCase()}:
                      </Text>
                      <Box
                        maxWidth="280px"
                        overflowY="auto"
                        dangerouslySetInnerHTML={{
                          __html: value[valueKey],
                        }}
                      />
                    </Box>
                  ))}
                </Td>
              </Tr>
            );
          }

          return (
            <Tr key={index}>
              <Td>{key}</Td>
              <Td>{value}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

const ChangesTables = ({
  changes,
}: {
  changes: Record<string, any[]> | null;
}) => {
  if (!changes) {
    return null;
  }
  const keys = Object.keys(changes);

  const beforeChanges = keys.reduce((acc, key) => {
    if (changes[key][0]) {
      acc[key] = changes[key][0];
    }
    return acc;
  }, {});

  const afterChanges = keys.reduce((acc, key) => {
    if (changes[key][1]) {
      acc[key] = changes[key][1];
    }
    return acc;
  }, {});

  return (
    <div>
      <Box display="flex" gap="8px">
        <Box flex="1">
          <Title color="primary" variant="h2">
            Before
          </Title>
          <ChangesTable changes={beforeChanges} />
        </Box>
        <Box flex="1">
          <Title color="primary" variant="h2">
            After
          </Title>
          <ChangesTable changes={afterChanges} />
        </Box>
      </Box>
    </div>
  );
};

export default ChangesTables;
