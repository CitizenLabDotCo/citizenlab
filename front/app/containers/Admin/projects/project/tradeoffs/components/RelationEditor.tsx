import React from 'react';

import {
  Badge,
  Box,
  Button,
  IconButton,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { Pair, Relation, RelationKind } from '../types';
import {
  RELATION_BACKGROUND,
  RELATION_COLOR,
  RELATION_SYMBOL,
  majorityVote,
  participantsDisagree,
  StatementLookup,
  totalParticipantVotes,
} from '../utils/display';

const KINDS: readonly RelationKind[] = ['exclusive', 'additive', 'neutral'];

const kindMessage = (kind: RelationKind) =>
  kind === 'exclusive'
    ? messages.kindExclusive
    : kind === 'additive'
    ? messages.kindAdditive
    : messages.kindNeutral;

const kindHelp = (kind: RelationKind) =>
  kind === 'exclusive'
    ? messages.kindExclusiveHelp
    : kind === 'additive'
    ? messages.kindAdditiveHelp
    : messages.kindNeutralHelp;

const sourceMessage = (relation: Relation) =>
  relation.source === 'ai'
    ? messages.sourceAi
    : relation.source === 'admin'
    ? messages.sourceAdmin
    : messages.sourceParticipants;

interface Props {
  pair: Pair;
  relation?: Relation;
  lookup: StatementLookup;
  onSetKind: (pair: Pair, kind: RelationKind) => void;
  onConfirm: (pair: Pair) => void;
  onClose: () => void;
}

const StatementCard = ({
  number,
  title,
  summary,
}: {
  number?: number;
  title: string;
  summary: string;
}) => (
  <Box
    flex="1 1 0"
    minWidth="0"
    p="12px"
    bgColor={colors.white}
    border={`1px solid ${colors.grey300}`}
    borderRadius="3px"
  >
    <Text m="0" fontSize="s" fontWeight="bold">
      #{number} {title}
    </Text>
    <Text m="0" mt="4px" fontSize="xs" color="textSecondary">
      {summary}
    </Text>
  </Box>
);

const RelationEditor = ({
  pair,
  relation,
  lookup,
  onSetKind,
  onConfirm,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const a = lookup.byId.get(pair[0]);
  const b = lookup.byId.get(pair[1]);
  if (!a || !b) return null;

  const kind = relation?.kind ?? 'neutral';
  const votes = relation?.participantVotes;
  const total = votes ? totalParticipantVotes(votes) : 0;
  const disagree = relation ? participantsDisagree(relation) : false;

  return (
    <Box
      p="16px"
      bgColor={colors.grey50}
      border={`2px solid ${colors.orange500}`}
      borderRadius="3px"
      data-cy="tradeoffs-relation-editor"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Title variant="h4" m="0">
          {formatMessage(messages.relationHeading, {
            a: `#${lookup.numberOf.get(a.id)}`,
            b: `#${lookup.numberOf.get(b.id)}`,
          })}
        </Title>
        <IconButton
          iconName="close"
          a11y_buttonActionMessage={formatMessage(messages.close)}
          onClick={onClose}
          iconColor={colors.textSecondary}
          iconColorOnHover={colors.textPrimary}
        />
      </Box>

      <Box display="flex" gap="12px" alignItems="stretch" mt="12px">
        <StatementCard
          number={lookup.numberOf.get(a.id)}
          title={a.title}
          summary={a.summary}
        />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="44px"
          flexShrink={0}
        >
          <Box
            w="36px"
            h="36px"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgColor={RELATION_BACKGROUND[kind]}
            border={`2px solid ${RELATION_COLOR[kind]}`}
          >
            <Text
              m="0"
              fontSize="l"
              fontWeight="bold"
              style={{ color: RELATION_COLOR[kind] }}
            >
              {RELATION_SYMBOL[kind]}
            </Text>
          </Box>
        </Box>
        <StatementCard
          number={lookup.numberOf.get(b.id)}
          title={b.title}
          summary={b.summary}
        />
      </Box>

      <Box display="flex" gap="8px" mt="16px" flexWrap="wrap">
        {KINDS.map((option) => (
          <Box key={option} flex="1 1 0" minWidth="160px">
            <Button
              buttonStyle={option === kind ? 'primary' : 'secondary-outlined'}
              width="100%"
              size="s"
              onClick={() => onSetKind(pair, option)}
            >
              {RELATION_SYMBOL[option]} {formatMessage(kindMessage(option))}
            </Button>
            <Text
              m="0"
              mt="4px"
              fontSize="xs"
              color="textSecondary"
              textAlign="center"
            >
              {formatMessage(kindHelp(option))}
            </Text>
          </Box>
        ))}
      </Box>

      <Box mt="16px" display="flex" gap="16px" flexWrap="wrap">
        <Box flex="1 1 0" minWidth="240px">
          {relation ? (
            <>
              <Box display="flex" gap="8px" alignItems="center" flexWrap="wrap">
                <Badge
                  color={
                    relation.confirmed ? colors.green700 : colors.orange500
                  }
                >
                  {relation.confirmed
                    ? formatMessage(messages.confirmed)
                    : formatMessage(sourceMessage(relation))}
                </Badge>
                {!relation.confirmed && (
                  <Text m="0" fontSize="xs" color="textSecondary">
                    {formatMessage(messages.confidence, {
                      percent: Math.round(relation.confidence * 100),
                    })}
                  </Text>
                )}
                {disagree && (
                  <Badge color={colors.red600}>
                    {formatMessage(messages.participantsDisagree)}
                  </Badge>
                )}
              </Box>
              <Text m="0" mt="8px" fontSize="s">
                {relation.rationale}
              </Text>
              {!relation.confirmed && (
                <Box mt="12px">
                  <Button
                    buttonStyle="primary"
                    size="s"
                    icon="check"
                    onClick={() => onConfirm(pair)}
                  >
                    {formatMessage(messages.confirmRelation, {
                      kind: formatMessage(
                        kindMessage(relation.kind)
                      ).toLowerCase(),
                    })}
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Text m="0" fontSize="s" color="textSecondary">
              <FormattedMessage {...messages.noRelation} />
            </Text>
          )}
        </Box>

        <Box flex="1 1 0" minWidth="240px">
          {votes && total > 0 ? (
            <>
              <Text m="0" fontSize="xs" fontWeight="bold" color="textSecondary">
                {formatMessage(messages.participantVotesHeading, {
                  count: total,
                })}
              </Text>
              <Box
                display="flex"
                h="12px"
                mt="6px"
                borderRadius="6px"
                overflow="hidden"
                bgColor={colors.grey200}
              >
                {KINDS.map((option) => (
                  <Box
                    key={option}
                    h="100%"
                    w={`${(votes[option] / total) * 100}%`}
                    bgColor={RELATION_COLOR[option]}
                    title={`${formatMessage(kindMessage(option))}: ${
                      votes[option]
                    }`}
                  />
                ))}
              </Box>
              <Box display="flex" gap="12px" mt="6px" flexWrap="wrap">
                {KINDS.map((option) => (
                  <Text
                    key={option}
                    m="0"
                    fontSize="xs"
                    fontWeight={
                      majorityVote(votes) === option ? 'bold' : 'normal'
                    }
                    style={{ color: RELATION_COLOR[option] }}
                  >
                    {RELATION_SYMBOL[option]}{' '}
                    {formatMessage(kindMessage(option))}{' '}
                    {Math.round((votes[option] / total) * 100)}%
                  </Text>
                ))}
              </Box>
            </>
          ) : (
            <Text m="0" fontSize="xs" color="textSecondary">
              <FormattedMessage {...messages.noParticipantVotes} />
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RelationEditor;
