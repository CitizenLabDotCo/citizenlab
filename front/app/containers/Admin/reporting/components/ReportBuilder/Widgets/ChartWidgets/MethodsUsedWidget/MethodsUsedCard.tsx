import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Statistic from 'components/admin/Graphs/Statistic';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';
import { Props } from './typings';

const PARTICIPATION_METHODS = [
  'information',
  'ideation',
  'survey',
  'voting',
  'volunteering',
  'document_annotation',
] as const;

type ParticipationMethod = (typeof PARTICIPATION_METHODS)[number];

const LABELS: Record<ParticipationMethod, MessageDescriptor> = {
  information: messages.information,
  ideation: messages.ideation,
  survey: messages.survey,
  voting: messages.voting,
  volunteering: messages.volunteering,
  document_annotation: messages.document_annotation,
};

const MethodsUsedCard = (_props: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      {PARTICIPATION_METHODS.map((method) => (
        <Box
          key={method}
          display="inline-block"
          width="120px"
          mb="12px"
          mr="12px"
        >
          <Statistic
            name={formatMessage(LABELS[method])}
            value={Math.floor(Math.random() * 100)}
            nameColor="black"
          />
        </Box>
      ))}
    </Box>
  );
};

export default MethodsUsedCard;
