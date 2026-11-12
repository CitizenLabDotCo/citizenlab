import React from 'react';

import { bo, Box, colors, Text } from '@citizenlab/cl2-component-library';

import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';
import { IPhaseData } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../CommonGroundManager/messages';

interface Props {
  phase: IPhaseData | undefined;
  ideaId: string;
}

const CommonGroundReactions = ({ phase, ideaId }: Props) => {
  const { formatMessage } = useIntl();
  const isCommonGround =
    phase?.attributes.participation_method === 'common_ground';
  const { data: results } = useCommonGroundResults(
    isCommonGround ? phase.id : undefined
  );
  if (!isCommonGround || !results) return null;

  const { stats, ideas_by_agreement } = results.data.attributes;
  const votes = ideas_by_agreement.find((idea) => idea.id === ideaId)?.votes;
  const agree = votes?.up ?? 0;
  const disagree = votes?.down ?? 0;
  const unsure = votes?.neutral ?? 0;
  const seen = agree + disagree + unsure;
  const total = Math.max(stats.num_participants, seen);
  const parts = [
    {
      label: formatMessage(messages.agree),
      count: agree,
      color: colors.teal500,
    },
    {
      label: formatMessage(messages.disagree),
      count: disagree,
      color: colors.red500,
    },
    {
      label: formatMessage(messages.unsure),
      count: unsure,
      color: colors.grey400,
    },
    {
      label: formatMessage(messages.notSeenYet),
      count: total - seen,
      color: colors.grey200,
    },
  ];

  return (
    <Box data-cy="e2e-common-ground-reactions">
      <Box
        display="flex"
        height="12px"
        overflow="hidden"
        borderRadius={bo.borderRadius}
        background={colors.grey100}
        aria-hidden
      >
        {parts.map((part) => (
          <Box
            key={part.label}
            width={`${total ? (part.count / total) * 100 : 0}%`}
            background={part.color}
          />
        ))}
      </Box>
      <Box as="div" m="0" mt="12px">
        {parts.map((part) => (
          <Box
            key={part.label}
            display="flex"
            alignItems="center"
            gap="8px"
            mb="8px"
          >
            <Box
              width="8px"
              height="8px"
              borderRadius="50%"
              background={part.color}
              aria-hidden
            />
            <Box flexGrow={1}>
              <Text as="span" variant="boLabel" m="0">
                {part.label}
              </Text>
            </Box>
            <Text as="span" variant="boLabel" m="0">
              {part.count}
            </Text>
            <Text
              as="span"
              variant="boHelper"
              m="0"
              width="42px"
              textAlign="right"
            >
              {total ? Math.round((part.count / total) * 100) : 0}%
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CommonGroundReactions;
