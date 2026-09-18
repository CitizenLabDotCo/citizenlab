import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { Axis, OpinionGroupsAttributes, Point } from 'api/opinion_groups/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { ColorBy } from './Controls';
import messages from './messages';
import {
  UNKNOWN_COLOR,
  colorForIndex,
  fieldsByKey,
  formatShare,
  statementsById,
} from './utils';

interface Series {
  key: string;
  label: string;
  color: string;
  points: Point[];
}

interface Props {
  attributes: OpinionGroupsAttributes;
  colorBy: ColorBy;
}

interface TooltipPayloadItem {
  payload?: Point;
}

const buildSeries = (
  attributes: OpinionGroupsAttributes,
  colorBy: ColorBy,
  groupLabel: (name: string) => string,
  localize: ReturnType<typeof useLocalize>,
  unknownLabel: string
): Series[] => {
  if (colorBy.type === 'group') {
    return attributes.groups.map((group) => ({
      key: `group-${group.id}`,
      label: groupLabel(group.name),
      color: colorForIndex(group.id),
      points: attributes.points.filter((point) => point.group === group.id),
    }));
  }

  const field = fieldsByKey(attributes.demographic_fields).get(
    colorBy.fieldKey
  );
  if (!field) return [];

  const series = field.categories.map((category, index) => ({
    key: category.key,
    label: localize(category.title_multiloc),
    color: colorForIndex(index),
    points: attributes.points.filter(
      (point) => point.demographics[field.key] === category.key
    ),
  }));
  const unknown = attributes.points.filter(
    (point) => !point.demographics[field.key]
  );
  return [
    ...series.filter((s) => s.points.length > 0),
    ...(unknown.length > 0
      ? [
          {
            key: 'unknown',
            label: unknownLabel,
            color: UNKNOWN_COLOR,
            points: unknown,
          },
        ]
      : []),
  ];
};

const OpinionMap = ({ attributes, colorBy }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const statements = statementsById(attributes.statements);
  const fields = fieldsByKey(attributes.demographic_fields);

  const groupLabel = (name: string) =>
    formatMessage(messages.groupName, { name });
  const series = buildSeries(
    attributes,
    colorBy,
    groupLabel,
    localize,
    formatMessage(messages.unknown)
  );

  const centroids = attributes.groups.map((group) => ({
    x: group.centroid.x,
    y: group.centroid.y,
    name: group.name,
    color: colorForIndex(group.id),
  }));

  const PointTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
  }) => {
    const point = payload?.[0]?.payload;
    if (!active || !point) return null;
    const group = attributes.groups.find((g) => g.id === point.group);
    return (
      <Box
        bgColor="white"
        p="8px 12px"
        border={`1px solid ${colors.grey300}`}
        borderRadius="3px"
        boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      >
        <Text m="0" fontSize="s" fontWeight="bold">
          {group ? groupLabel(group.name) : ''}
        </Text>
        <Text m="0" fontSize="xs" color="textSecondary">
          {formatMessage(messages.tooltipVotes, { count: point.votes })}
        </Text>
        {Object.entries(point.demographics).map(([fieldKey, value]) => {
          const field = fields.get(fieldKey);
          const category = field?.categories.find((c) => c.key === value);
          if (!field) return null;
          return (
            <Text key={fieldKey} m="0" fontSize="xs" color="textSecondary">
              {localize(field.title_multiloc)}:{' '}
              {category
                ? localize(category.title_multiloc)
                : formatMessage(messages.unknown)}
            </Text>
          );
        })}
      </Box>
    );
  };

  const renderAxis = (axis: Axis, label: string) => (
    <Box flex="1 1 280px">
      <Text m="0" fontSize="s" fontWeight="bold">
        {label}{' '}
        <Text as="span" fontSize="xs" color="textSecondary" fontWeight="normal">
          {formatMessage(messages.axisExplanation, {
            percentage: formatShare(axis.explained_variance),
          })}
        </Text>
      </Text>
      {[
        { items: axis.positive, message: messages.axisPositive },
        { items: axis.negative, message: messages.axisNegative },
      ].map(({ items, message }) =>
        items.length > 0 ? (
          <Box key={message.id} mt="4px">
            <Text m="0" fontSize="xs" color="textSecondary">
              <FormattedMessage {...message} />
            </Text>
            <Box as="ul" m="0" pl="16px">
              {items.map((item) => (
                <Text as="li" key={item.statement_id} m="0" fontSize="xs">
                  {localize(statements.get(item.statement_id)?.title_multiloc)}
                </Text>
              ))}
            </Box>
          </Box>
        ) : null
      )}
      {axis.demographics.length > 0 && (
        <Box mt="4px">
          <Text m="0" fontSize="xs" color="textSecondary">
            <FormattedMessage {...messages.axisDemographics} />
          </Text>
          <Box as="ul" m="0" pl="16px">
            {axis.demographics.map((item) => {
              const field = fields.get(item.field_key);
              const category = field?.categories.find(
                (c) => c.key === item.category_key
              );
              return (
                <Text
                  as="li"
                  key={`${item.field_key}-${item.category_key}`}
                  m="0"
                  fontSize="xs"
                >
                  {field ? localize(field.title_multiloc) : item.field_key}:{' '}
                  {category
                    ? localize(category.title_multiloc)
                    : item.category_key}{' '}
                  ({item.loading > 0 ? '+' : ''}
                  {item.loading.toFixed(2)})
                </Text>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      p="16px"
      bgColor="white"
      border={`1px solid ${colors.grey300}`}
      borderRadius="3px"
    >
      <Title variant="h3" m="0" color="textPrimary">
        <FormattedMessage {...messages.mapTitle} />
      </Title>
      <Text fontSize="xs" color="textSecondary" m="0" mt="4px">
        <FormattedMessage {...messages.mapHint} />
      </Text>

      <Box display="flex" flexWrap="wrap" gap="16px" mt="12px">
        {series.map((s) => (
          <Box key={s.key} display="flex" alignItems="center" gap="6px">
            <Box
              width="12px"
              height="12px"
              borderRadius="50%"
              bgColor={s.color}
            />
            <Text m="0" fontSize="s">
              {s.label} ({s.points.length})
            </Text>
          </Box>
        ))}
      </Box>

      <Box width="100%" height="440px" mt="8px">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
            <CartesianGrid stroke={colors.grey200} />
            <XAxis type="number" dataKey="x" tick={false} axisLine={false} />
            <YAxis type="number" dataKey="y" tick={false} axisLine={false} />
            <ZAxis range={[36, 36]} />
            <Tooltip
              content={<PointTooltip />}
              cursor={false}
              isAnimationActive={false}
            />
            {series.map((s) => (
              <Scatter
                key={s.key}
                name={s.label}
                data={s.points}
                fill={s.color}
                fillOpacity={0.75}
                stroke="white"
                strokeWidth={1}
                isAnimationActive={false}
              />
            ))}
            <Scatter
              data={centroids}
              isAnimationActive={false}
              shape={(props: {
                cx?: number;
                cy?: number;
                payload?: { name: string; color: string };
              }) => {
                const { cx = 0, cy = 0, payload } = props;
                if (!payload) return <g />;
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={14}
                      fill="white"
                      stroke={payload.color}
                      strokeWidth={2}
                    />
                    <text
                      x={cx}
                      y={cy}
                      dy={5}
                      textAnchor="middle"
                      fontSize={13}
                      fontWeight={700}
                      fill={payload.color}
                    >
                      {payload.name}
                    </text>
                  </g>
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>

      <Box display="flex" flexWrap="wrap" gap="24px" mt="8px">
        {renderAxis(attributes.axes.x, formatMessage(messages.axisHorizontal))}
        {renderAxis(attributes.axes.y, formatMessage(messages.axisVertical))}
      </Box>
    </Box>
  );
};

export default OpinionMap;
