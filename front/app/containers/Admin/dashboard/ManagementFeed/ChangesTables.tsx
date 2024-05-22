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
                  {valueKeys.map((valueKey) => (
                    <Box key={valueKey}>
                      <Text fontWeight="bold" color="primary" fontSize="s">
                        {valueKey.toUpperCase()}:
                      </Text>
                      {/* When the value might be a project / folder / idea description, we display it as HTML */}
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
  const { formatMessage } = useIntl();

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
            {formatMessage(messages.before)}
          </Title>
          <ChangesTable changes={beforeChanges} />
        </Box>
        <Box flex="1">
          <Title color="primary" variant="h2">
            {formatMessage(messages.after)}
          </Title>
          <ChangesTable changes={afterChanges} />
        </Box>
      </Box>
    </div>
  );
};

export default ChangesTables;
