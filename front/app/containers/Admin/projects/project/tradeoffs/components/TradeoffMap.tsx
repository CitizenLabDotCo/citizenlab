import React, { useMemo, useState } from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { Pair, Relation, Statement } from '../types';
import {
  RELATION_COLOR,
  RELATION_SYMBOL,
  StatementLookup,
  wrapLabel,
} from '../utils/display';
import { computeForceLayout } from '../utils/layout';
import { pairKey, WeightFn } from '../utils/solver';

const WIDTH = 760;
const HEIGHT = 600;
const MIN_RADIUS = 16;
const MAX_EXTRA_RADIUS = 20;

interface Props {
  statements: readonly Statement[];
  relations: readonly Relation[];
  lookup: StatementLookup;
  weightOf: WeightFn;
  selectedIds: readonly string[];
  blocked: ReadonlyMap<string, readonly string[]>;
  activePair?: Pair;
  onToggleStatement: (id: string) => void;
  onSelectPair: (pair: Pair) => void;
}

const TradeoffMap = ({
  statements,
  relations,
  lookup,
  weightOf,
  selectedIds,
  blocked,
  activePair,
  onToggleStatement,
  onSelectPair,
}: Props) => {
  const { formatMessage } = useIntl();
  const [hoveredId, setHoveredId] = useState<string | undefined>();

  const maxWeight = useMemo(
    () => Math.max(1, ...statements.map(weightOf)),
    [statements, weightOf]
  );
  const radiusOf = (statement: Statement) =>
    MIN_RADIUS + MAX_EXTRA_RADIUS * Math.sqrt(weightOf(statement) / maxWeight);

  const positions = useMemo(
    () =>
      computeForceLayout(statements, relations, {
        width: WIDTH,
        height: HEIGHT,
        radiusOf: (statement) =>
          MIN_RADIUS +
          MAX_EXTRA_RADIUS * Math.sqrt(weightOf(statement) / maxWeight),
      }),
    [statements, relations, weightOf, maxWeight]
  );

  const selected = new Set(selectedIds);
  const activeKey = activePair ? pairKey(activePair[0], activePair[1]) : null;
  const hovered = hoveredId ? lookup.byId.get(hoveredId) : undefined;
  const hoveredPosition = hoveredId ? positions.get(hoveredId) : undefined;

  const visibleRelations = relations.filter(
    (relation) => relation.kind !== 'neutral'
  );

  return (
    <Box position="relative" w="100%">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        role="img"
        aria-label={formatMessage(messages.title)}
        style={{ display: 'block', background: colors.grey50, borderRadius: 3 }}
      >
        <g>
          {visibleRelations.map((relation) => {
            const from = positions.get(relation.a);
            const to = positions.get(relation.b);
            if (!from || !to) return null;
            const key = pairKey(relation.a, relation.b);
            const bothSelected =
              selected.has(relation.a) && selected.has(relation.b);
            const isActive = key === activeKey;
            const dimmed =
              hoveredId !== undefined &&
              hoveredId !== relation.a &&
              hoveredId !== relation.b;
            const color = RELATION_COLOR[relation.kind];
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            return (
              <g
                key={key}
                onClick={() => onSelectPair([relation.a, relation.b])}
                style={{ cursor: 'pointer', opacity: dimmed ? 0.15 : 1 }}
              >
                <title>
                  {`${RELATION_SYMBOL[relation.kind]} ${relation.rationale}`}
                </title>
                {isActive && (
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={colors.orange500}
                    strokeOpacity={0.35}
                    strokeWidth={14}
                    strokeLinecap="round"
                  />
                )}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="transparent"
                  strokeWidth={16}
                />
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={color}
                  strokeWidth={bothSelected ? 4 : 2}
                  strokeDasharray={relation.confirmed ? undefined : '7 5'}
                  strokeLinecap="round"
                />
                <circle
                  cx={midX}
                  cy={midY}
                  r={bothSelected && relation.kind === 'exclusive' ? 11 : 9}
                  fill={
                    bothSelected && relation.kind === 'exclusive'
                      ? color
                      : colors.white
                  }
                  stroke={color}
                  strokeWidth={relation.confirmed ? 1.5 : 1}
                  strokeDasharray={relation.confirmed ? undefined : '2 2'}
                />
                <text
                  x={midX}
                  y={midY + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={13}
                  fontWeight={700}
                  fill={
                    bothSelected && relation.kind === 'exclusive'
                      ? colors.white
                      : color
                  }
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {RELATION_SYMBOL[relation.kind]}
                </text>
              </g>
            );
          })}
        </g>
        <g>
          {statements.map((statement) => {
            const position = positions.get(statement.id);
            if (!position) return null;
            const radius = radiusOf(statement);
            const isSelected = selected.has(statement.id);
            const isBlocked = blocked.has(statement.id);
            const isHovered = hoveredId === statement.id;
            const number = lookup.numberOf.get(statement.id) ?? 0;
            const fill = isSelected
              ? colors.primary
              : isBlocked
              ? colors.red100
              : colors.white;
            const stroke = isSelected
              ? colors.primary
              : isBlocked
              ? colors.red500
              : isHovered
              ? colors.primary
              : colors.grey500;
            const lines = wrapLabel(statement.title, 26);
            return (
              <g
                key={statement.id}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`#${number} ${statement.title}`}
                onClick={() => onToggleStatement(statement.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggleStatement(statement.id);
                  }
                }}
                onMouseEnter={() => setHoveredId(statement.id)}
                onMouseLeave={() => setHoveredId(undefined)}
                onFocus={() => setHoveredId(statement.id)}
                onBlur={() => setHoveredId(undefined)}
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {isHovered && (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={radius + 6}
                    fill="none"
                    stroke={colors.primary}
                    strokeOpacity={0.3}
                    strokeWidth={4}
                  />
                )}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={radius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={isBlocked ? '5 4' : undefined}
                />
                <text
                  x={position.x}
                  y={position.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={radius > 26 ? 15 : 13}
                  fontWeight={700}
                  fill={
                    isSelected
                      ? colors.white
                      : isBlocked
                      ? colors.red600
                      : colors.textPrimary
                  }
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {number}
                </text>
                <text
                  x={position.x}
                  y={position.y + radius + 14}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={isSelected ? 600 : 400}
                  fill={isBlocked ? colors.red600 : colors.textPrimary}
                  stroke={colors.grey50}
                  strokeWidth={3}
                  style={{
                    paintOrder: 'stroke',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {lines.map((line, i) => (
                    <tspan key={i} x={position.x} dy={i === 0 ? 0 : 13}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hovered && hoveredPosition && (
        <Box
          position="absolute"
          style={{
            left: `${(hoveredPosition.x / WIDTH) * 100}%`,
            top: `${(hoveredPosition.y / HEIGHT) * 100}%`,
            transform: `translate(${
              hoveredPosition.x > WIDTH / 2 ? '-100%' : '0'
            }, ${hoveredPosition.y > HEIGHT / 2 ? '-100%' : '0'}) translate(${
              hoveredPosition.x > WIDTH / 2 ? '-' : ''
            }${MIN_RADIUS + MAX_EXTRA_RADIUS + 8}px, ${
              hoveredPosition.y > HEIGHT / 2 ? '-' : ''
            }${MIN_RADIUS + MAX_EXTRA_RADIUS + 8}px)`,
            pointerEvents: 'none',
          }}
          bgColor={colors.white}
          border={`1px solid ${colors.grey300}`}
          borderRadius="3px"
          boxShadow="0px 4px 12px -1px rgba(0,0,0,0.15)"
          p="12px"
          maxWidth="280px"
          zIndex="2"
        >
          <Text m="0" fontSize="s" fontWeight="bold">
            #{lookup.numberOf.get(hovered.id)} {hovered.title}
          </Text>
          <Text m="0" mt="4px" fontSize="xs" color="textSecondary">
            {hovered.summary}
          </Text>
          <Text m="0" mt="8px" fontSize="xs" color="textSecondary">
            {formatMessage(messages.columnVotes)}: {hovered.votes} ·{' '}
            {formatMessage(messages.columnLikes)}: {hovered.likes} ·{' '}
            {formatMessage(messages.columnWeight)}: {weightOf(hovered)}
          </Text>
          {blocked.has(hovered.id) && (
            <Text m="0" mt="4px" fontSize="xs" color="red600">
              {formatMessage(messages.blockedBy, {
                labels: (blocked.get(hovered.id) ?? [])
                  .map((id) => `#${lookup.numberOf.get(id) ?? '?'}`)
                  .join(', '),
              })}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TradeoffMap;
