import React, { useState } from 'react';

import {
  Badge,
  Box,
  Button,
  IconButton,
  Text,
  Title,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { Statement } from '../types';
import { labelsOf, percent, StatementLookup } from '../utils/display';
import { PackageEvaluation, WeightFn } from '../utils/solver';

interface Props {
  topic: string;
  statements: readonly Statement[];
  lookup: StatementLookup;
  weightOf: WeightFn;
  evaluation: PackageEvaluation;
  blocked: ReadonlyMap<string, readonly string[]>;
  suggestions: readonly PackageEvaluation[];
  naive: PackageEvaluation;
  completion?: PackageEvaluation;
  onRemove: (id: string) => void;
  onUsePackage: (ids: readonly string[]) => void;
  onClear: () => void;
}

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

const Stat = ({
  label,
  tone,
}: {
  label: string;
  tone: 'neutral' | 'good' | 'bad';
}) => (
  <Box
    px="10px"
    py="4px"
    borderRadius="14px"
    bgColor={
      tone === 'good'
        ? colors.green100
        : tone === 'bad'
        ? colors.red100
        : colors.grey100
    }
  >
    <Text
      m="0"
      fontSize="xs"
      fontWeight="bold"
      color={
        tone === 'good'
          ? 'green700'
          : tone === 'bad'
          ? 'red600'
          : 'textSecondary'
      }
    >
      {label}
    </Text>
  </Box>
);

const DecisionBuilder = ({
  topic,
  statements,
  lookup,
  weightOf,
  evaluation,
  blocked,
  suggestions,
  naive,
  completion,
  onRemove,
  onUsePackage,
  onClear,
}: Props) => {
  const { formatMessage } = useIntl();
  const [copied, setCopied] = useState(false);

  const total = statements.reduce(
    (sum, statement) => sum + weightOf(statement),
    0
  );
  const included = statements.filter((statement) =>
    evaluation.ids.includes(statement.id)
  );
  const leftOut = statements.filter((statement) => blocked.has(statement.id));
  const canComplete =
    evaluation.feasible &&
    completion !== undefined &&
    !sameIds(completion.ids, evaluation.ids);

  const draft = [
    `${topic}`,
    '',
    formatMessage(messages.draftCoverage, {
      percent: percent(evaluation.coverage),
      support: Math.round(evaluation.support),
      total: Math.round(total),
    }),
    '',
    `${formatMessage(messages.draftIncluded)} (${included.length})`,
    ...included.map(
      (statement) => `- ${statement.title} (${weightOf(statement)})`
    ),
    '',
    `${formatMessage(messages.draftLeftOut)} (${leftOut.length})`,
    ...leftOut.map(
      (statement) =>
        `- ${statement.title} (${weightOf(statement)}): ${formatMessage(
          messages.draftConflictsWith,
          {
            labels: (blocked.get(statement.id) ?? [])
              .map((id) => lookup.byId.get(id)?.title ?? id)
              .join(', '),
          }
        )}`
    ),
  ].join('\n');

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Box
      p="20px"
      bgColor={colors.white}
      border={`1px solid ${colors.grey300}`}
      borderRadius="3px"
      display="flex"
      flexDirection="column"
      gap="20px"
      data-cy="tradeoffs-decision-builder"
    >
      <Box>
        <Title variant="h3" m="0">
          <FormattedMessage {...messages.decisionPackage} />
        </Title>
        <Box display="flex" alignItems="baseline" gap="8px" mt="8px">
          <Text
            m="0"
            fontSize="xxxxl"
            fontWeight="bold"
            color={evaluation.feasible ? 'primary' : 'red600'}
            style={{ lineHeight: 1 }}
          >
            {percent(evaluation.coverage)}%
          </Text>
          <Text m="0" fontSize="s" color="textSecondary">
            <FormattedMessage {...messages.coverageLabel} />
          </Text>
        </Box>
        <Box
          mt="8px"
          h="10px"
          bgColor={colors.grey200}
          borderRadius="5px"
          overflow="hidden"
        >
          <Box
            h="100%"
            w={`${percent(evaluation.coverage)}%`}
            bgColor={evaluation.feasible ? colors.primary : colors.red500}
            style={{ transition: 'width 250ms ease-out' }}
          />
        </Box>
        <Box display="flex" gap="6px" mt="10px" flexWrap="wrap">
          <Stat
            tone="neutral"
            label={formatMessage(messages.statementsCount, {
              count: evaluation.ids.length,
            })}
          />
          <Stat
            tone={evaluation.synergies.length > 0 ? 'good' : 'neutral'}
            label={formatMessage(messages.synergiesCount, {
              count: evaluation.synergies.length,
            })}
          />
          <Stat
            tone={evaluation.conflicts.length > 0 ? 'bad' : 'neutral'}
            label={formatMessage(messages.conflictsCount, {
              count: evaluation.conflicts.length,
            })}
          />
        </Box>
      </Box>

      <Box>
        {included.length === 0 ? (
          <Text m="0" fontSize="s" color="textSecondary">
            <FormattedMessage {...messages.emptyPackage} />
          </Text>
        ) : (
          <Box display="flex" flexDirection="column" gap="4px">
            {included.map((statement) => (
              <Box
                key={statement.id}
                display="flex"
                alignItems="center"
                gap="8px"
                p="6px 8px"
                bgColor={colors.teal50}
                borderRadius="3px"
              >
                <Text
                  m="0"
                  fontSize="xs"
                  fontWeight="bold"
                  color="primary"
                  style={{ width: 24, flexShrink: 0 }}
                >
                  {lookup.numberOf.get(statement.id)}
                </Text>
                <Text m="0" fontSize="s" style={{ flex: '1 1 0' }}>
                  {statement.title}
                </Text>
                <Text m="0" fontSize="xs" color="textSecondary">
                  {weightOf(statement)}
                </Text>
                <IconButton
                  iconName="close"
                  a11y_buttonActionMessage={formatMessage(messages.remove)}
                  onClick={() => onRemove(statement.id)}
                  iconColor={colors.textSecondary}
                  iconColorOnHover={colors.red600}
                  iconWidth="16px"
                  iconHeight="16px"
                />
              </Box>
            ))}
          </Box>
        )}

        {leftOut.length > 0 && (
          <Box mt="12px">
            <Text m="0" fontSize="xs" fontWeight="bold" color="red600">
              <FormattedMessage {...messages.blockedHeading} />
            </Text>
            <Box display="flex" flexDirection="column" gap="2px" mt="4px">
              {leftOut.map((statement) => (
                <Box
                  key={statement.id}
                  display="flex"
                  gap="8px"
                  alignItems="baseline"
                >
                  <Text
                    m="0"
                    fontSize="xs"
                    color="red600"
                    style={{ width: 24, flexShrink: 0 }}
                  >
                    {lookup.numberOf.get(statement.id)}
                  </Text>
                  <Text
                    m="0"
                    fontSize="xs"
                    color="textSecondary"
                    style={{ flex: '1 1 0' }}
                  >
                    <span style={{ textDecoration: 'line-through' }}>
                      {statement.title}
                    </span>{' '}
                    ·{' '}
                    {formatMessage(messages.blockedBy, {
                      labels: labelsOf(lookup, blocked.get(statement.id) ?? []),
                    })}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box display="flex" gap="8px" mt="12px">
          <Tooltip content={formatMessage(messages.completeTooltip)}>
            <div>
              <Button
                buttonStyle="primary"
                size="s"
                icon="stars"
                disabled={!canComplete}
                onClick={() => completion && onUsePackage(completion.ids)}
              >
                <FormattedMessage {...messages.completePackage} />
              </Button>
            </div>
          </Tooltip>
          <Button
            buttonStyle="text"
            size="s"
            disabled={evaluation.ids.length === 0}
            onClick={onClear}
          >
            <FormattedMessage {...messages.clear} />
          </Button>
        </Box>
      </Box>

      <Box>
        <Title variant="h4" m="0">
          <FormattedMessage {...messages.suggestionsHeading} />
        </Title>
        <Text m="0" mt="4px" fontSize="xs" color="textSecondary">
          <FormattedMessage {...messages.suggestionsDescription} />
        </Text>
        <Box display="flex" flexDirection="column" gap="8px" mt="10px">
          {suggestions.map((suggestion, i) => {
            const isCurrent = sameIds(suggestion.ids, evaluation.ids);
            return (
              <Box
                key={i}
                p="10px 12px"
                border={`1px solid ${
                  isCurrent ? colors.primary : colors.grey300
                }`}
                bgColor={isCurrent ? colors.teal50 : colors.white}
                borderRadius="3px"
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center" gap="8px">
                    <Text
                      m="0"
                      fontSize="s"
                      fontWeight="bold"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {formatMessage(messages.option, {
                        letter: String.fromCharCode(65 + i),
                      })}
                    </Text>
                    <Text m="0" fontSize="s" fontWeight="bold" color="primary">
                      {percent(suggestion.coverage)}%
                    </Text>
                    <Text m="0" fontSize="xs" color="textSecondary">
                      {formatMessage(messages.statementsCount, {
                        count: suggestion.ids.length,
                      })}{' '}
                      ·{' '}
                      {formatMessage(messages.synergiesCount, {
                        count: suggestion.synergies.length,
                      })}
                    </Text>
                  </Box>
                  {isCurrent ? (
                    <Badge color={colors.primary} className="inverse">
                      {formatMessage(messages.currentSuggestion)}
                    </Badge>
                  ) : (
                    <Button
                      buttonStyle="secondary-outlined"
                      size="s"
                      onClick={() => onUsePackage(suggestion.ids)}
                    >
                      <FormattedMessage {...messages.useSuggestion} />
                    </Button>
                  )}
                </Box>
                <Box display="flex" gap="4px" mt="6px" flexWrap="wrap">
                  {statements
                    .filter((statement) =>
                      suggestion.ids.includes(statement.id)
                    )
                    .map((statement) => (
                      <Box
                        key={statement.id}
                        px="6px"
                        py="1px"
                        bgColor={colors.grey100}
                        borderRadius="3px"
                        title={statement.title}
                      >
                        <Text m="0" fontSize="xs" color="textSecondary">
                          #{lookup.numberOf.get(statement.id)}
                        </Text>
                      </Box>
                    ))}
                </Box>
              </Box>
            );
          })}
        </Box>
        <Text m="0" mt="8px" fontSize="xs" color="textSecondary">
          {formatMessage(messages.naiveComparison, {
            count: naive.ids.length,
            conflicts: naive.conflicts.length,
          })}
        </Text>
      </Box>

      {included.length > 0 && (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Title variant="h4" m="0">
              <FormattedMessage {...messages.draftHeading} />
            </Title>
            <Button
              buttonStyle="secondary-outlined"
              size="s"
              icon={copied ? 'check' : 'copy'}
              onClick={copyDraft}
            >
              <FormattedMessage
                {...(copied ? messages.copied : messages.copyDraft)}
              />
            </Button>
          </Box>
          <Box
            mt="8px"
            p="12px"
            bgColor={colors.grey50}
            borderRadius="3px"
            maxHeight="220px"
            overflowY="auto"
          >
            <Text
              m="0"
              fontSize="xs"
              color="textSecondary"
              style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
            >
              {draft}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DecisionBuilder;
