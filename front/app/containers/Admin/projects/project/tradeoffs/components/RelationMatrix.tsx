import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { Pair, Relation, Statement } from '../types';
import {
  RELATION_BACKGROUND,
  RELATION_COLOR,
  RELATION_SYMBOL,
  StatementLookup,
  truncate,
} from '../utils/display';
import { findRelation, indexRelations, pairKey } from '../utils/solver';

const CELL = 28;

const Grid = styled.table`
  border-collapse: separate;
  border-spacing: 3px;

  th {
    font-weight: 400;
    text-align: left;
  }
`;

const Cell = styled.button<{ $active: boolean; $bothSelected: boolean }>`
  width: ${CELL}px;
  height: ${CELL}px;
  border-radius: 3px;
  border: 2px solid
    ${({ $active, $bothSelected }) =>
      $active
        ? colors.orange500
        : $bothSelected
        ? colors.primary
        : 'transparent'};
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  padding: 0;

  &:hover,
  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 1px;
  }
`;

interface Props {
  statements: readonly Statement[];
  relations: readonly Relation[];
  lookup: StatementLookup;
  selectedIds: readonly string[];
  blocked: ReadonlyMap<string, readonly string[]>;
  activePair?: Pair;
  onSelectPair: (pair: Pair) => void;
}

const RelationMatrix = ({
  statements,
  relations,
  lookup,
  selectedIds,
  blocked,
  activePair,
  onSelectPair,
}: Props) => {
  const { formatMessage } = useIntl();
  const index = indexRelations(relations);
  const selected = new Set(selectedIds);
  const activeKey = activePair ? pairKey(activePair[0], activePair[1]) : null;

  const rowBackground = (id: string) =>
    selected.has(id)
      ? colors.teal100
      : blocked.has(id)
      ? colors.red100
      : 'transparent';

  return (
    <Box overflowX="auto">
      <Grid>
        <thead>
          <tr>
            <th />
            {statements.map((statement) => (
              <th key={statement.id} style={{ textAlign: 'center' }}>
                <Text
                  m="0"
                  fontSize="xs"
                  fontWeight={selected.has(statement.id) ? 'bold' : 'normal'}
                  color={blocked.has(statement.id) ? 'red600' : 'textSecondary'}
                >
                  {lookup.numberOf.get(statement.id)}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {statements.map((row) => (
            <tr key={row.id}>
              <th>
                <Box
                  display="flex"
                  alignItems="center"
                  gap="8px"
                  px="8px"
                  py="2px"
                  borderRadius="3px"
                  bgColor={rowBackground(row.id)}
                  minWidth="230px"
                >
                  <Text
                    m="0"
                    fontSize="xs"
                    fontWeight="bold"
                    color={blocked.has(row.id) ? 'red600' : 'textSecondary'}
                    style={{ width: 24, flexShrink: 0 }}
                  >
                    {lookup.numberOf.get(row.id)}
                  </Text>
                  <Text
                    m="0"
                    fontSize="xs"
                    color={blocked.has(row.id) ? 'red600' : 'textPrimary'}
                    style={{
                      whiteSpace: 'nowrap',
                      textDecoration: blocked.has(row.id)
                        ? 'line-through'
                        : undefined,
                    }}
                    title={row.title}
                  >
                    {truncate(row.title, 34)}
                  </Text>
                </Box>
              </th>
              {statements.map((column) => {
                if (row.id === column.id) {
                  return (
                    <td key={column.id}>
                      <Box
                        w={`${CELL}px`}
                        h={`${CELL}px`}
                        bgColor={colors.grey200}
                        borderRadius="3px"
                      />
                    </td>
                  );
                }
                const relation = findRelation(index, row.id, column.id);
                const kind = relation?.kind ?? 'neutral';
                const bothSelected =
                  relation !== undefined &&
                  relation.kind !== 'neutral' &&
                  selected.has(row.id) &&
                  selected.has(column.id);
                const key = pairKey(row.id, column.id);
                const label = relation
                  ? `${formatMessage(
                      kind === 'exclusive'
                        ? messages.kindExclusive
                        : kind === 'additive'
                        ? messages.kindAdditive
                        : messages.kindNeutral
                    )}${
                      relation.confirmed
                        ? ''
                        : ` · ${formatMessage(messages.legendUnconfirmed)}`
                    }`
                  : formatMessage(messages.noRelation);
                return (
                  <td key={column.id}>
                    <Cell
                      type="button"
                      $active={key === activeKey}
                      $bothSelected={bothSelected}
                      title={`#${lookup.numberOf.get(
                        row.id
                      )} × #${lookup.numberOf.get(column.id)}: ${label}`}
                      aria-label={`#${lookup.numberOf.get(
                        row.id
                      )} × #${lookup.numberOf.get(column.id)}: ${label}`}
                      onClick={() => onSelectPair([row.id, column.id])}
                      style={{
                        background: relation
                          ? RELATION_BACKGROUND[kind]
                          : colors.grey100,
                        color: RELATION_COLOR[kind],
                        opacity: relation && !relation.confirmed ? 0.6 : 1,
                      }}
                    >
                      {relation && kind !== 'neutral'
                        ? RELATION_SYMBOL[kind]
                        : ''}
                    </Cell>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Grid>
    </Box>
  );
};

export default RelationMatrix;
