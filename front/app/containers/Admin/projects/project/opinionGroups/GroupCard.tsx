import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';

import {
  GroupDemographics,
  OpinionGroup,
  OpinionGroupsAttributes,
} from 'api/opinion_groups/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import {
  REPRESENTATION_HIGH,
  REPRESENTATION_LOW,
  UNKNOWN_COLOR,
  colorForIndex,
  fieldsByKey,
  formatShare,
  statementsById,
} from './utils';

interface Props {
  group: OpinionGroup;
  attributes: OpinionGroupsAttributes;
}

const GroupCard = ({ group, attributes }: Props) => {
  const { formatMessage, formatNumber } = useIntl();
  const localize = useLocalize();
  const statements = statementsById(attributes.statements);
  const fields = fieldsByKey(attributes.demographic_fields);
  const color = colorForIndex(group.id);
  const threshold = attributes.parameters.privacy_threshold;

  const renderDemographics = (demographics: GroupDemographics) => {
    const field = fields.get(demographics.field_key);
    if (!field) return null;
    const total = demographics.categories.reduce(
      (sum, category) => sum + (category.count ?? 0),
      0
    );
    const notable = demographics.categories.filter(
      (category) =>
        category.index !== null &&
        (category.index >= REPRESENTATION_HIGH ||
          category.index <= REPRESENTATION_LOW)
    );

    return (
      <Box key={demographics.field_key} mt="8px">
        <Text m="0" fontSize="xs" color="textSecondary">
          {localize(field.title_multiloc)}
        </Text>
        {/* 100% stacked bar of the known, non-suppressed categories */}
        <Box display="flex" height="10px" mt="4px" gap="2px">
          {field.categories.map((category, index) => {
            const cell = demographics.categories.find(
              (c) => c.key === category.key
            );
            const count = cell?.count ?? 0;
            if (total === 0 || count === 0) return null;
            return (
              <Box
                key={category.key}
                width={`${(count / total) * 100}%`}
                bgColor={colorForIndex(index)}
                borderRadius="2px"
                title={`${localize(category.title_multiloc)}: ${formatShare(
                  cell?.share
                )}`}
              />
            );
          })}
          {demographics.categories.some((c) => c.suppressed) && (
            <Box
              flex="0 0 10px"
              bgColor={UNKNOWN_COLOR}
              borderRadius="2px"
              title={formatMessage(messages.hiddenSmallGroup, { threshold })}
            />
          )}
        </Box>
        <Box display="flex" flexWrap="wrap" gap="4px 12px" mt="4px">
          {field.categories.map((category, index) => {
            const cell = demographics.categories.find(
              (c) => c.key === category.key
            );
            if (!cell || (cell.count === 0 && !cell.suppressed)) return null;
            return (
              <Box
                key={category.key}
                display="flex"
                alignItems="center"
                gap="4px"
              >
                <Box
                  width="8px"
                  height="8px"
                  borderRadius="50%"
                  bgColor={
                    cell.suppressed ? UNKNOWN_COLOR : colorForIndex(index)
                  }
                />
                <Text m="0" fontSize="xs" color="textSecondary">
                  {localize(category.title_multiloc)}{' '}
                  {cell.suppressed
                    ? `(< ${threshold})`
                    : `${formatShare(cell.share)}`}
                </Text>
              </Box>
            );
          })}
        </Box>
        {notable.map((category) => {
          const definition = field.categories.find(
            (c) => c.key === category.key
          );
          const index = category.index ?? 1;
          const over = index >= REPRESENTATION_HIGH;
          const categoryLabel = definition
            ? localize(definition.title_multiloc)
            : category.key;
          const message =
            category.count === 0
              ? formatMessage(messages.absentInGroup, {
                  category: categoryLabel,
                })
              : formatMessage(
                  over ? messages.overRepresented : messages.underRepresented,
                  {
                    category: categoryLabel,
                    index: over
                      ? index.toFixed(1)
                      : (1 / Math.max(index, 0.01)).toFixed(1),
                  }
                );
          return (
            <Text
              key={category.key}
              m="0"
              mt="4px"
              fontSize="xs"
              color={over ? 'success' : 'textSecondary'}
            >
              {over ? '▲' : '▼'} {message}
            </Text>
          );
        })}
      </Box>
    );
  };

  const hasNotable = group.demographics.some((d) =>
    d.categories.some(
      (c) =>
        c.index !== null &&
        (c.index >= REPRESENTATION_HIGH || c.index <= REPRESENTATION_LOW)
    )
  );

  return (
    <Box
      p="16px"
      bgColor="white"
      border={`1px solid ${colors.grey300}`}
      borderTop={`4px solid ${color}`}
      borderRadius="3px"
    >
      <Box display="flex" alignItems="baseline" gap="8px">
        <Title variant="h3" m="0" color="textPrimary">
          {formatMessage(messages.groupName, { name: group.name })}
        </Title>
        <Text m="0" fontSize="s" color="textSecondary">
          {formatMessage(messages.groupSize, {
            count: formatNumber(group.size),
            share: formatShare(group.share),
          })}
        </Text>
      </Box>

      <Text m="0" mt="12px" fontSize="s" fontWeight="bold">
        <FormattedMessage {...messages.whatSetsApart} />
      </Text>
      {group.representative.length === 0 && (
        <Text m="0" mt="4px" fontSize="xs" color="textSecondary">
          <FormattedMessage {...messages.noRepresentative} />
        </Text>
      )}
      {group.representative.map((item) => {
        const agree = item.direction === 'agree';
        return (
          <Box key={`${item.statement_id}-${item.direction}`} mt="8px">
            <Box display="flex" gap="8px" alignItems="flex-start">
              <Text
                m="0"
                fontSize="xs"
                fontWeight="bold"
                color={agree ? 'success' : 'error'}
                style={{ whiteSpace: 'nowrap' }}
              >
                {formatMessage(agree ? messages.agrees : messages.disagrees)}
              </Text>
              <Text m="0" fontSize="s">
                {localize(statements.get(item.statement_id)?.title_multiloc)}
              </Text>
            </Box>
            <Text m="0" fontSize="xs" color="textSecondary" pl="0">
              {formatMessage(messages.insideVersusOutside, {
                inside: formatShare(item.inside_share),
                outside: formatShare(item.outside_share),
              })}
            </Text>
          </Box>
        );
      })}

      {attributes.demographic_fields.length > 0 && (
        <>
          <Text m="0" mt="16px" fontSize="s" fontWeight="bold">
            <FormattedMessage {...messages.whoIsInGroup} />
          </Text>
          {group.demographics.map(renderDemographics)}
          {!hasNotable && (
            <Text m="0" mt="8px" fontSize="xs" color="textSecondary">
              <FormattedMessage {...messages.balancedGroup} />
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

export default GroupCard;
