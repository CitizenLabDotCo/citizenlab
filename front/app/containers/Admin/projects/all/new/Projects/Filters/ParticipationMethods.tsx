import React from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import FilterSelector from 'components/FilterSelector';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';

const OPTIONS: { value: ParticipationMethod; message: MessageDescriptor }[] = [
  {
    value: 'ideation',
    message: messages.participationMethodIdeation,
  },
  {
    value: 'voting',
    message: messages.participationMethodVoting,
  },
  {
    value: 'information',
    message: messages.participationMethodInformation,
  },
  {
    value: 'proposals',
    message: messages.participationMethodProposals,
  },
  {
    value: 'native_survey',
    message: messages.participationMethodNativeSurvey,
  },
  {
    value: 'poll',
    message: messages.participationMethodPoll,
  },
  {
    value: 'volunteering',
    message: messages.participationMethodVolunteering,
  },
  {
    value: 'document_annotation',
    message: messages.participationMethodDocumentAnnotation,
  },
];

interface Props {
  participationMethods: ParticipationMethod[];
  onChange: (participationMethods: ParticipationMethod[]) => void;
}

const ParticipationMethods = ({ participationMethods, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    value: option.value,
    text: formatMessage(option.message),
  }));

  return (
    <Tooltip
      content={
        <Box w="240px">
          {formatMessage(messages.filterByCurrentPhaseMethod)}
        </Box>
      }
    >
      <FilterSelector
        name="participation-methods-select"
        title={formatMessage(messages.participationMethodLabel)}
        multipleSelectionAllowed
        selected={participationMethods}
        values={options}
        onChange={onChange}
      />
    </Tooltip>
  );
};

export default ParticipationMethods;
