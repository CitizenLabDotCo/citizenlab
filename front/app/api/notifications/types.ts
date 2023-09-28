import { Multiloc } from 'typings';
import notificationsKeys from './keys';

import { Keys } from 'utils/cl-react-query/types';
import { InternalCommentType } from 'api/campaigns/types';

export type NotificationsKeys = Keys<typeof notificationsKeys>;

export type IQueryParameters = {
  pageSize?: number;
  pageNumber?: number;
};

export interface IBaseNotificationData {
  id: string;
  type: string;
  relationships: {
    recipient: {
      data: {
        id: string;
        type: string;
      };
    };
  };
}

export interface IAdminRightsReceivedNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'admin_rights_received';
    read_at: string | null;
    created_at: string;
  };
}

type PostType = 'Initiative' | 'Idea';

export interface ICommentDeletedByAdminNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'comment_deleted_by_admin';
    read_at: string | null;
    created_at: string;
    post_type: PostType;
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
    post_type: PostType;
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
    post_type: PostType;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface ICommentOnIdeaYouFollowNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'comment_on_idea_you_follow';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface ICommentOnInitiativeYouFollowNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'comment_on_initiative_you_follow';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface ICosponsorOfYourInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'cosponsor_of_your_initiative';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_slug: string | null;
  };
}

export interface IEventUpcomingNotificationData extends IBaseNotificationData {
  attributes: {
    type: 'event_upcoming';
    read_at: string | null;
    created_at: string;
    event_id: string;
    event_title_multiloc: Multiloc;
    event_start_at: string | null;
    project_title_multiloc: Multiloc;
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

export interface IInitiativeResubmittedForReviewNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'initiative_resubmitted_for_review';
    read_at: string | null;
    created_at: string;
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

export interface IInvitationToCosponsorInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'invitation_to_cosponsor_initiative';
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_slug: string | null;
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
    post_type: PostType;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IInternalCommentNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: InternalCommentType;
    read_at: string | null;
    created_at: string;
    initiating_user_first_name: string | null;
    initiating_user_last_name: string | null;
    initiating_user_slug: string | null;
    post_type: PostType;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
    post_id: string;
    internal_comment_id: string;
    project_id: string | null;
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
    post_type: PostType;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IOfficialFeedbackOnIdeaYouFollowNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_idea_you_follow';
    read_at: string | null;
    created_at: string;
    official_feedback_author: Multiloc;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IOfficialFeedbackOnInitiativeYouFollowNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_initiative_you_follow';
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

export interface IProjectPublishedNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'project_published';
    read_at: string | null;
    created_at: string;
    project_slug: string;
    project_title_multiloc: Multiloc;
  };
}

export interface IStatusChangeOnIdeaYouFollowNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_on_idea_you_follow';
    read_at: string | null;
    created_at: string;
    post_title_multiloc: Multiloc;
    post_slug: string;
    idea_status_title_multiloc: Multiloc;
  };
}

export interface IStatusChangeOnInitiativeYouFollowNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_on_initiative_you_follow';
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

export interface IProjectFolderModerationRightsReceivedNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'project_folder_moderation_rights_received';
    read_at: string | null;
    created_at: string;
    project_folder_id: string;
    project_folder_title_multiloc: Multiloc;
  };
}

export interface IVotingBasketSubmittedNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'voting_basket_submitted';
    read_at: string | null;
    created_at: string;
    project_slug: string;
    project_title_multiloc: Multiloc;
  };
}

export interface IVotingBasketNotSubmittedNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'voting_basket_not_submitted';
    read_at: string | null;
    created_at: string;
    project_slug: string;
    project_title_multiloc: Multiloc;
    phase_title_multiloc: Multiloc;
  };
}

export interface IVotingLastChanceNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'voting_last_chance';
    read_at: string | null;
    created_at: string;
    project_slug: string;
    phase_title_multiloc: Multiloc;
  };
}

export interface IVotingResultsNotificationData extends IBaseNotificationData {
  attributes: {
    type: 'voting_results';
    read_at: string | null;
    created_at: string;
    project_slug: string;
    phase_title_multiloc: Multiloc;
  };
}

export interface INotificationDataMap {
  IAdminRightsReceivedNotificationData: IAdminRightsReceivedNotificationData;
  ICommentDeletedByAdminNotificationData: ICommentDeletedByAdminNotificationData;
  ICommentMarkedAsSpamNotificationData: ICommentMarkedAsSpamNotificationData;
  ICommentOnYourCommentNotificationData: ICommentOnYourCommentNotificationData;
  ICommentOnIdeaYouFollowNotificationData: ICommentOnIdeaYouFollowNotificationData;
  ICommentOnInitiativeYouFollowNotificationData: ICommentOnInitiativeYouFollowNotificationData;
  ICosponsorOfYourInitiativeNotificationData: ICosponsorOfYourInitiativeNotificationData;
  IEventUpcomingNotificationData: IEventUpcomingNotificationData;
  IIdeaAssignedToYouNotificationData: IIdeaAssignedToYouNotificationData;
  IIdeaMarkedAsSpamNotificationData: IIdeaMarkedAsSpamNotificationData;
  IInitiativeAssignedToYouNotificationData: IInitiativeAssignedToYouNotificationData;
  IInitiativeMarkedAsSpamNotificationData: IInitiativeMarkedAsSpamNotificationData;
  IInitiativeResubmittedForReviewNotificationData: IInitiativeResubmittedForReviewNotificationData;
  IInviteAcceptedNotificationData: IInviteAcceptedNotificationData;
  IInvitationToCosponsorInitiativeNotificationData: IInvitationToCosponsorInitiativeNotificationData;
  IMentionInCommentNotificationData: IMentionInCommentNotificationData;
  IInternalCommentNotificationData: IInternalCommentNotificationData;
  IMentionInOfficialFeedbackNotificationData: IMentionInOfficialFeedbackNotificationData;
  IOfficialFeedbackOnIdeaYouFollowNotificationData: IOfficialFeedbackOnIdeaYouFollowNotificationData;
  IOfficialFeedbackOnInitiativeYouFollowNotificationData: IOfficialFeedbackOnInitiativeYouFollowNotificationData;
  IProjectModerationRightsReceivedNotificationData: IProjectModerationRightsReceivedNotificationData;
  IProjectPhaseStartedNotificationData: IProjectPhaseStartedNotificationData;
  IProjectPhaseUpcomingNotificationData: IProjectPhaseUpcomingNotificationData;
  IProjectPublishedNotificationData: IProjectPublishedNotificationData;
  IStatusChangeOnIdeaYouFollowNotificationData: IStatusChangeOnIdeaYouFollowNotificationData;
  IStatusChangeOnInitiativeYouFollowNotificationData: IStatusChangeOnInitiativeYouFollowNotificationData;
  IThresholdReachedForAdminNotificationData: IThresholdReachedForAdminNotificationData;
  IProjectFolderModerationRightsReceivedNotificationData: IProjectFolderModerationRightsReceivedNotificationData;
  IVotingBasketSubmittedNotificationData: IVotingBasketSubmittedNotificationData;
  IVotingBasketNotSubmittedNotificationData: IVotingBasketNotSubmittedNotificationData;
  IVotingLastChanceNotificationData: IVotingLastChanceNotificationData;
  IVotingResultsNotificationData: IVotingResultsNotificationData;
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
