import React from 'react';

import {
  Badge,
  Box,
  Button,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { Pair, Relation } from '../types';
import {
  RELATION_COLOR,
  RELATION_SYMBOL,
  participantsDisagree,
  StatementLookup,
  truncate,
} from '../utils/display';
import { pairKey } from '../utils/solver';

interface Props {
  relations: readonly Relation[];
  lookup: StatementLookup;
  activePair?: Pair;
  onSelectPair: (pair: Pair) => void;
}

const ReviewQueue = ({
  relations,
  lookup,
  activePair,
  onSelectPair,
}: Props) => {
  const { formatMessage } = useIntl();
  const activeKey = activePair ? pairKey(activePair[0], activePair[1]) : null;

  const queue = relations
    .filter((relation) => !relation.confirmed)
    .sort((a, b) => {
      const disagreeA = participantsDisagree(a) ? 1 : 0;
      const disagreeB = participantsDisagree(b) ? 1 : 0;
      if (disagreeA !== disagreeB) return disagreeB - disagreeA;
      return a.confidence - b.confidence;
    });

  return (
    <Box>
      <Box display="flex" alignItems="center" gap="8px">
        <Title variant="h3" m="0">
          <FormattedMessage {...messages.reviewQueue} />
        </Title>
        <Badge
          color={queue.length > 0 ? colors.orange500 : colors.green700}
          className="inverse"
        >
          {queue.length}
        </Badge>
      </Box>
      <Text m="0" mt="4px" mb="12px" fontSize="s" color="textSecondary">
        <FormattedMessage {...messages.reviewQueueDescription} />
      </Text>

      {queue.length === 0 ? (
        <Text m="0" fontSize="s" color="green700">
          <FormattedMessage {...messages.reviewQueueEmpty} />
        </Text>
      ) : (
        <Box display="flex" flexDirection="column" gap="6px">
          {queue.map((relation) => {
            const a = lookup.byId.get(relation.a);
            const b = lookup.byId.get(relation.b);
            if (!a || !b) return null;
            const key = pairKey(relation.a, relation.b);
            const isActive = key === activeKey;
            return (
              <Box
                key={key}
                display="flex"
                alignItems="center"
                gap="12px"
                p="8px 12px"
                bgColor={isActive ? colors.orange100 : colors.white}
                border={`1px solid ${
                  isActive ? colors.orange500 : colors.grey300
                }`}
                borderRadius="3px"
              >
                <Box
                  w="28px"
                  h="28px"
                  flexShrink={0}
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border={`2px dashed ${RELATION_COLOR[relation.kind]}`}
                >
                  <Text
                    m="0"
                    fontWeight="bold"
                    style={{ color: RELATION_COLOR[relation.kind] }}
                  >
                    {RELATION_SYMBOL[relation.kind]}
                  </Text>
                </Box>
                <Box flex="1 1 0" minWidth="0">
                  <Text m="0" fontSize="s">
                    <b>#{lookup.numberOf.get(a.id)}</b> {truncate(a.title, 64)}
                  </Text>
                  <Text m="0" fontSize="s">
                    <span style={{ color: RELATION_COLOR[relation.kind] }}>
                      <b>{RELATION_SYMBOL[relation.kind]}</b>
                    </span>{' '}
                    <b>#{lookup.numberOf.get(b.id)}</b> {truncate(b.title, 64)}
                  </Text>
                  <Box display="flex" gap="8px" alignItems="center" mt="2px">
                    <Text m="0" fontSize="xs" color="textSecondary">
                      {formatMessage(messages.confidence, {
                        percent: Math.round(relation.confidence * 100),
                      })}
                    </Text>
                    {participantsDisagree(relation) && (
                      <Badge color={colors.red600}>
                        {formatMessage(messages.participantsDisagree)}
                      </Badge>
                    )}
                  </Box>
                </Box>
                <Button
                  buttonStyle="secondary-outlined"
                  size="s"
                  onClick={() => onSelectPair([relation.a, relation.b])}
                >
                  <FormattedMessage {...messages.review} />
                </Button>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default ReviewQueue;
