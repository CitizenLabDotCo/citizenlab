import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

import { authUserStream } from './auth';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/notifications`;

export interface IBaseNotificationData {
  id: string;
  type: string;
}

export interface IAdminRightsReceivedNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'admin_rights_received';
    read_at: string | null;
    created_at: string;
  };
}

export interface ICommentDeletedByAdminNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'comment_deleted_by_admin';
    read_at: string | null;
    created_at: string;
    post_type: 'Initiative' | 'Idea';
    post_slug: string | null;
    post_title_multiloc: Multiloc;
    reason_code: 'irrelevant' | 'inappropriate' | 'other';
    other_reason: string;
  };
}

export interface ICommentMarkedAsSpamNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'comment_marked_as_spam';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_type: 'Initiative' | 'Idea';
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface ICommentOnYourCommentNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'comment_on_your_comment';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_type: 'Initiative' | 'Idea';
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface ICommentOnYourIdeaNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'comment_on_your_idea';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface ICommentOnYourInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'comment_on_your_initiative';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IIdeaAssignedToYouNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'idea_assigned_to_you';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_title_multiloc: Multiloc;
    post_slug: string;
  };
}

export interface IIdeaMarkedAsSpamNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'idea_marked_as_spam';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_title_multiloc: Multiloc;
    post_slug: string;
  };
}

export interface IInitiativeAssignedToYouNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'initiative_assigned_to_you';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_title_multiloc: Multiloc;
    post_slug: string;
  };
}

export interface IInitiativeMarkedAsSpamNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'initiative_marked_as_spam';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_title_multiloc: Multiloc;
    post_slug: string;
  };
}

export interface IInviteAcceptedNotificationData extends IBaseNotificationData {
  attributes: {
    type: 'invite_accepted';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
  };
}

export interface IMentionInCommentNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'mention_in_comment';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_type: 'Initiative' | 'Idea';
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IMentionInOfficialFeedbackNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'mention_in_official_feedback';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    official_feedback_author: Multiloc;
    post_type: 'Initiative' | 'Idea';
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IOfficialFeedbackOnCommentedIdeaNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_commented_idea';
    read_at: string | null;
    created_at: string;
    official_feedback_author: Multiloc;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IOfficialFeedbackOnCommentedInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_commented_initiative';
    read_at: string | null;
    created_at: string;
    official_feedback_author: Multiloc;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IOfficialFeedbackOnVotedIdeaNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_voted_idea';
    read_at: string | null;
    created_at: string;
    official_feedback_author: Multiloc;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IOfficialFeedbackOnVotedInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_voted_initiative';
    read_at: string | null;
    created_at: string;
    official_feedback_author: Multiloc;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IOfficialFeedbackOnYourIdeaNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_your_idea';
    read_at: string | null;
    created_at: string;
    official_feedback_author: Multiloc;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IOfficialFeedbackOnYourInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_your_initiative';
    read_at: string | null;
    created_at: string;
    official_feedback_author: Multiloc;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IProjectModerationRightsReceivedNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'project_moderation_rights_received';
    read_at: string | null;
    created_at: string;
    project_id: string;
    project_title_multiloc: Multiloc;
  };
}

export interface IProjectPhaseStartedNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'project_phase_started';
    read_at: string | null;
    created_at: string;
    phase_title_multiloc: Multiloc;
    phase_start_at: string;
    project_slug: string;
    project_title_multiloc: Multiloc;
  };
}

export interface IProjectPhaseUpcomingNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'project_phase_upcoming';
    read_at: string | null;
    created_at: string;
    phase_title_multiloc: Multiloc;
    phase_start_at: string;
    project_slug: string;
    project_title_multiloc: Multiloc;
  };
}

export interface IStatusChangeOfYourIdeaNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_of_your_idea';
    read_at: string | null;
    created_at: string;
    post_title_multiloc: Multiloc;
    post_slug: string;
    idea_status_title_multiloc: Multiloc;
  };
}

export interface IStatusChangeOfYourInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_of_your_initiative';
    read_at: string | null;
    created_at: string;
    post_title_multiloc: Multiloc;
    post_slug: string;
    initiative_status_title_multiloc: Multiloc;
  };
}

export interface IStatusChangeOnCommentedIdeaNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_on_commented_idea';
    read_at: string | null;
    created_at: string;
    post_title_multiloc: Multiloc;
    post_slug: string;
    idea_status_title_multiloc: Multiloc;
  };
}

export interface IStatusChangeOnCommentedInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_on_commented_initiative';
    read_at: string | null;
    created_at: string;
    post_title_multiloc: Multiloc;
    post_slug: string;
    initiative_status_title_multiloc: Multiloc;
  };
}

export interface IStatusChangeOnVotedIdeaNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_on_voted_idea';
    read_at: string | null;
    created_at: string;
    post_title_multiloc: Multiloc;
    post_slug: string;
    idea_status_title_multiloc: Multiloc;
  };
}

export interface IStatusChangeOnVotedInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_on_voted_initiative';
    read_at: string | null;
    created_at: string;
    post_title_multiloc: Multiloc;
    post_slug: string;
    initiative_status_title_multiloc: Multiloc;
  };
}

export interface IThresholdReachedForAdminNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'threshold_reached_for_admin';
    read_at: string | null;
    created_at: string;
    post_title_multiloc: Multiloc;
    post_slug: string;
  };
}

export interface INotificationDataMap {
  IAdminRightsReceivedNotificationData: IAdminRightsReceivedNotificationData;
  ICommentDeletedByAdminNotificationData: ICommentDeletedByAdminNotificationData;
  ICommentMarkedAsSpamNotificationData: ICommentMarkedAsSpamNotificationData;
  ICommentOnYourCommentNotificationData: ICommentOnYourCommentNotificationData;
  ICommentOnYourIdeaNotificationData: ICommentOnYourIdeaNotificationData;
  ICommentOnYourInitiativeNotificationData: ICommentOnYourInitiativeNotificationData;
  IIdeaAssignedToYouNotificationData: IIdeaAssignedToYouNotificationData;
  IIdeaMarkedAsSpamNotificationData: IIdeaMarkedAsSpamNotificationData;
  IInitiativeAssignedToYouNotificationData: IInitiativeAssignedToYouNotificationData;
  IInitiativeMarkedAsSpamNotificationData: IInitiativeMarkedAsSpamNotificationData;
  IInviteAcceptedNotificationData: IInviteAcceptedNotificationData;
  IMentionInCommentNotificationData: IMentionInCommentNotificationData;
  IMentionInOfficialFeedbackNotificationData: IMentionInOfficialFeedbackNotificationData;
  IOfficialFeedbackOnCommentedIdeaNotificationData: IOfficialFeedbackOnCommentedIdeaNotificationData;
  IOfficialFeedbackOnCommentedInitiativeNotificationData: IOfficialFeedbackOnCommentedInitiativeNotificationData;
  IOfficialFeedbackOnVotedIdeaNotificationData: IOfficialFeedbackOnVotedIdeaNotificationData;
  IOfficialFeedbackOnVotedInitiativeNotificationData: IOfficialFeedbackOnVotedInitiativeNotificationData;
  IOfficialFeedbackOnYourIdeaNotificationData: IOfficialFeedbackOnYourIdeaNotificationData;
  IOfficialFeedbackOnYourInitiativeNotificationData: IOfficialFeedbackOnYourInitiativeNotificationData;
  IProjectModerationRightsReceivedNotificationData: IProjectModerationRightsReceivedNotificationData;
  IProjectPhaseStartedNotificationData: IProjectPhaseStartedNotificationData;
  IProjectPhaseUpcomingNotificationData: IProjectPhaseUpcomingNotificationData;
  IStatusChangeOfYourIdeaNotificationData: IStatusChangeOfYourIdeaNotificationData;
  IStatusChangeOfYourInitiativeNotificationData: IStatusChangeOfYourInitiativeNotificationData;
  IStatusChangeOnCommentedIdeaNotificationData: IStatusChangeOnCommentedIdeaNotificationData;
  IStatusChangeOnCommentedInitiativeNotificationData: IStatusChangeOnCommentedInitiativeNotificationData;
  IStatusChangeOnVotedIdeaNotificationData: IStatusChangeOnVotedIdeaNotificationData;
  IStatusChangeOnVotedInitiativeNotificationData: IStatusChangeOnVotedInitiativeNotificationData;
  IThresholdReachedForAdminNotificationData: IThresholdReachedForAdminNotificationData;
}

export type TNotificationData =
  INotificationDataMap[keyof INotificationDataMap];
export type TNotificationType = TNotificationData['attributes']['type'];

export interface INotificationLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface INotifications {
  data: TNotificationData[];
  links: INotificationLinks;
}

export interface INotification {
  data: TNotificationData;
}

export function notificationsStream(streamParams: IStreamParams | null = null) {
  return streams.get<INotifications>({ apiEndpoint, ...streamParams });
}

export async function markAllAsRead() {
  const response = await streams.add(`${apiEndpoint}/mark_all_read`, null);
  await authUserStream().fetch();
  return response;
}
