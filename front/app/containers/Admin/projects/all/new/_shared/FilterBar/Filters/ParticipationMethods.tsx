import React from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

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
  onClear: () => void;
}

const ParticipationMethods = ({ onClear }: Props) => {
  const participationMethods = useParam('participation_methods') ?? [];
  const { formatMessage } = useIntl();

  const options = OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));

  const handleOnChange = (selected: string[]) => {
    // if the value is survey, we send both native and external surveys
    const updatedMethods = selected.includes('survey')
      ? [...selected, 'native_survey', 'survey']
      : selected;

    setParam('participation_methods', updatedMethods as ParticipationMethod[]);
    trackEventByName(tracks.setParticipationMethod, {
      participation_methods: JSON.stringify(updatedMethods),
    });
  };

  return (
    <Box display="flex" alignItems="center">
      <MultiSelect
        title={formatMessage(messages.participationMethodLabel)}
        selected={participationMethods}
        options={options}
        onChange={handleOnChange}
        onClear={onClear}
      />
      <IconTooltip
        content={formatMessage(messages.filterByCurrentPhaseMethod)}
        placement="top"
        ml="4px"
      />
    </Box>
  );
};

export default ParticipationMethods;
