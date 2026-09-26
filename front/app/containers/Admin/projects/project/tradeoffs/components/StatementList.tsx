import React from 'react';

import {
  Badge,
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  colors,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { Relation, Statement } from '../types';
import { formatDelta, labelsOf, StatementLookup } from '../utils/display';
import { marginalEffect, WeightFn } from '../utils/solver';

interface Props {
  statements: readonly Statement[];
  relations: readonly Relation[];
  lookup: StatementLookup;
  weightOf: WeightFn;
  selectedIds: readonly string[];
  blocked: ReadonlyMap<string, readonly string[]>;
  onToggleStatement: (id: string) => void;
}

const StatementList = ({
  statements,
  relations,
  lookup,
  weightOf,
  selectedIds,
  blocked,
  onToggleStatement,
}: Props) => {
  const { formatMessage } = useIntl();
  const selected = new Set(selectedIds);
  const maxWeight = Math.max(1, ...statements.map(weightOf));
  const sorted = [...statements].sort((a, b) => weightOf(b) - weightOf(a));

  const relationCounts = (id: string) => {
    const mine = relations.filter(
      (relation) => relation.a === id || relation.b === id
    );
    return {
      exclusive: mine.filter((relation) => relation.kind === 'exclusive')
        .length,
      additive: mine.filter((relation) => relation.kind === 'additive').length,
    };
  };

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>#</Th>
          <Th>
            <FormattedMessage {...messages.columnStatement} />
          </Th>
          <Th>
            <FormattedMessage {...messages.columnWeight} />
          </Th>
          <Th>
            <FormattedMessage {...messages.columnRelations} />
          </Th>
          <Th>
            <FormattedMessage {...messages.columnEffect} />
          </Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {sorted.map((statement) => {
          const isSelected = selected.has(statement.id);
          const blockers = blocked.get(statement.id);
          const counts = relationCounts(statement.id);
          const effect = marginalEffect(
            statement.id,
            selectedIds,
            statements,
            relations,
            weightOf
          );
          const weight = weightOf(statement);
          return (
            <Tr
              key={statement.id}
              background={
                isSelected
                  ? colors.teal50
                  : blockers
                  ? colors.red100
                  : undefined
              }
            >
              <Td>
                <Text m="0" fontWeight="bold" color="textSecondary">
                  {lookup.numberOf.get(statement.id)}
                </Text>
              </Td>
              <Td>
                <Text
                  m="0"
                  fontSize="s"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  style={{
                    textDecoration: blockers ? 'line-through' : undefined,
                  }}
                >
                  {statement.title}
                </Text>
                <Box
                  display="flex"
                  gap="8px"
                  alignItems="center"
                  mt="4px"
                  flexWrap="wrap"
                >
                  <Badge color={colors.coolGrey600}>{statement.theme}</Badge>
                  <Text m="0" fontSize="xs" color="textSecondary">
                    {formatMessage(messages.mergedFrom, {
                      count: statement.mergedInputs,
                    })}
                  </Text>
                </Box>
              </Td>
              <Td>
                <Box display="flex" alignItems="center" gap="8px">
                  <Box
                    w="70px"
                    h="8px"
                    bgColor={colors.grey200}
                    borderRadius="4px"
                    overflow="hidden"
                  >
                    <Box
                      h="100%"
                      w={`${(weight / maxWeight) * 100}%`}
                      bgColor={isSelected ? colors.primary : colors.grey500}
                    />
                  </Box>
                  <Text m="0" fontSize="s" fontWeight="bold">
                    {weight}
                  </Text>
                </Box>
                <Text m="0" mt="2px" fontSize="xs" color="textSecondary">
                  {statement.votes}{' '}
                  {formatMessage(messages.columnVotes).toLowerCase()} ·{' '}
                  {statement.likes}{' '}
                  {formatMessage(messages.columnLikes).toLowerCase()}
                </Text>
              </Td>
              <Td>
                <Box display="flex" gap="6px">
                  {counts.exclusive > 0 && (
                    <Text m="0" fontSize="xs" color="red600" fontWeight="bold">
                      {formatMessage(messages.exclusiveWith, {
                        count: counts.exclusive,
                      })}
                    </Text>
                  )}
                  {counts.additive > 0 && (
                    <Text
                      m="0"
                      fontSize="xs"
                      color="green700"
                      fontWeight="bold"
                    >
                      {formatMessage(messages.additiveWith, {
                        count: counts.additive,
                      })}
                    </Text>
                  )}
                </Box>
              </Td>
              <Td>
                {isSelected ? (
                  <Text m="0" fontSize="xs" color="primary" fontWeight="bold">
                    <FormattedMessage {...messages.inPackage} />
                  </Text>
                ) : (
                  <Box>
                    <Text
                      m="0"
                      fontSize="s"
                      fontWeight="bold"
                      color={effect.delta >= 0 ? 'green700' : 'red600'}
                    >
                      {formatDelta(effect.delta)}
                    </Text>
                    {effect.removed.length > 0 && (
                      <Text m="0" fontSize="xs" color="textSecondary">
                        {formatMessage(messages.effectReplaces, {
                          labels: labelsOf(lookup, effect.removed),
                        })}
                      </Text>
                    )}
                  </Box>
                )}
              </Td>
              <Td>
                <Button
                  buttonStyle={
                    isSelected ? 'secondary-outlined' : 'primary-outlined'
                  }
                  size="s"
                  onClick={() => onToggleStatement(statement.id)}
                >
                  <FormattedMessage
                    {...(isSelected ? messages.remove : messages.add)}
                  />
                </Button>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default StatementList;
