import { CampaignName } from 'api/campaigns/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import useInputTermLabels from '../InputManager/useInputTermLabels';

import messages from './notificationDescriptions/messages';

const DESCRIPTIONS: Partial<Record<CampaignName, MessageDescriptor>> = {
  comment_deleted_by_admin: messages.commentDeleted,
  comment_on_idea_you_follow: messages.followedComment,
  comment_on_your_comment: messages.commentReply,
  idea_published: messages.inputPublished,
  mention_in_official_feedback: messages.updateMention,
  official_feedback_on_idea_you_follow: messages.officialFeedback,
  project_phase_started: messages.phaseStarted,
  status_change_on_idea_you_follow: messages.statusChanged,
  your_input_in_screening: messages.screening,
  cosponsor_of_your_idea: messages.cosponsorAccepted,
  invitation_to_cosponsor_idea: messages.cosponsorInvitation,
  voting_basket_not_submitted: messages.unfinishedVote,
  voting_basket_submitted: messages.voteSubmitted,
  voting_last_chance: messages.lastChance,
  voting_phase_started: messages.votingStarted,
  voting_results: messages.votingResults,
  native_survey_not_submitted: messages.unfinishedSurvey,
  survey_submitted: messages.surveySubmitted,
};

const useNotificationDescription = (name: CampaignName) => {
  const { formatMessage } = useIntl();
  const { term } = useInputTermLabels();
  const message = DESCRIPTIONS[name];
  return message ? formatMessage(message, { term }) : undefined;
};
export default useNotificationDescription;
