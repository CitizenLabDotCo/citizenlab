import { ParticipationMethod } from 'api/phases/types';

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

const useParticipationMethodOptions = () => {
  const { formatMessage } = useIntl();

  return OPTIONS.map((option) => ({
    value: option.value,
    label: formatMessage(option.message),
  }));
};

export default useParticipationMethodOptions;
