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
  // Handles both native and external surveys
  {
    value: 'survey',
    message: messages.participationMethodSurvey,
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
    message: messages.pMDocumentAnnotation,
  },
  {
    value: 'common_ground',
    message: messages.participationMethodDocumentCommonGround,
  },
];

interface Props {
  values: ParticipationMethod[];
  onChange: (values: ParticipationMethod[]) => void;
}

const ParticipationMethods = ({ values, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    value: option.value,
    text: formatMessage(option.message),
  }));

  const handleOnChange = (selected: string[]) => {
    // if the value is survey, we send both native and external surveys
    const updatedMethods = selected.includes('survey')
      ? [...selected, 'native_survey', 'survey']
      : selected;
    onChange(updatedMethods as ParticipationMethod[]);
  };

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
        selected={values}
        values={options}
        onChange={handleOnChange}
      />
    </Tooltip>
  );
};

export default ParticipationMethods;
