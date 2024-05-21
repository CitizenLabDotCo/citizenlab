import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useMethodsUsed } from 'api/graph_data_units';
import { ParticipationMethod } from 'api/phases/types';

import Statistic from 'components/admin/Graphs/Statistic';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';
import { Props } from './typings';

const PARTICIPATION_METHODS: ParticipationMethod[] = [
  'information',
  'ideation',
  'native_survey',
  'voting',
  'volunteering',
  'poll',
  'survey',
  'document_annotation',
];

const LABELS: Record<ParticipationMethod, MessageDescriptor> = {
  information: messages.information,
  ideation: messages.ideation,
  native_survey: messages.nativeSurvey,
  voting: messages.voting,
  volunteering: messages.volunteering,
  poll: messages.poll,
  survey: messages.survey,
  document_annotation: messages.document_annotation,
};

const MethodsUsedCard = ({ startAt, endAt }: Props) => {
  const { formatMessage } = useIntl();
  const { data } = useMethodsUsed({ start_at: startAt, end_at: endAt });

  return (
    <Box>
      {PARTICIPATION_METHODS.map((method) => (
        <Box
          key={method}
          display="inline-block"
          width="120px"
          mb="8px"
          mr="12px"
        >
          <Statistic
            name={formatMessage(LABELS[method])}
            value={data?.data.attributes.count_per_method[method] ?? 0}
            nameColor="black"
          />
        </Box>
      ))}
    </Box>
  );
};

export default MethodsUsedCard;
