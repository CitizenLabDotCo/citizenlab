import { Multiloc } from 'typings';
import notificationsKeys from './keys';

import { Keys } from 'utils/cl-react-query/types';

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

interface IInternalcommentBaseAttributes {
  read_at: string | null;
  created_at: string;
  initiating_user_first_name: string | null;
  initiating_user_last_name: string | null;
  initiating_user_slug: string | null;
  post_type: 'Initiative' | 'Idea';
  post_slug: string | null;
  post_title_multiloc: Multiloc;
}

export interface IMentionInInternalCommentData extends IBaseNotificationData {
  attributes: {
    type: 'mention_in_internal_comment';
  } & IInternalcommentBaseAttributes;
}

export interface IInternalCommentOnYourInternalCommentData
  extends IBaseNotificationData {
  attributes: {
    type: 'internal_comment_on_your_internal_comment';
  } & IInternalcommentBaseAttributes;
}

export interface IInternalCommentOnIdeaAssignedToYouData
  extends IBaseNotificationData {
  attributes: {
    type: 'internal_comment_on_idea_assigned_to_you';
  } & IInternalcommentBaseAttributes;
}

export interface IInternalCommentOnInitiativeAssignedToYouData
  extends IBaseNotificationData {
  attributes: {
    type: 'internal_comment_on_initiative_assigned_to_you';
  } & IInternalcommentBaseAttributes;
}

export interface IInternalCommentOnIdeaYouModerateData
  extends IBaseNotificationData {
  attributes: {
    type: 'internal_comment_on_idea_you_moderate';
  } & IInternalcommentBaseAttributes;
}

export interface IInternalCommentOnIdeaYouCommentedInternallyOnData
  extends IBaseNotificationData {
  attributes: {
    type: 'internal_comment_on_idea_you_commented_internally_on';
  } & IInternalcommentBaseAttributes;
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

export interface IOfficialFeedbackOnReactedIdeaNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_reacted_idea';
    read_at: string | null;
    created_at: string;
    official_feedback_author: Multiloc;
    post_slug: string | null;
    post_title_multiloc: Multiloc;
  };
}

export interface IOfficialFeedbackOnReactedInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'official_feedback_on_reacted_initiative';
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

export interface IStatusChangeOnReactedIdeaNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_on_reacted_idea';
    read_at: string | null;
    created_at: string;
    post_title_multiloc: Multiloc;
    post_slug: string;
    idea_status_title_multiloc: Multiloc;
  };
}

export interface IStatusChangeOnReactedInitiativeNotificationData
  extends IBaseNotificationData {
  attributes: {
    type: 'status_change_on_reacted_initiative';
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
  IOfficialFeedbackOnReactedIdeaNotificationData: IOfficialFeedbackOnReactedIdeaNotificationData;
  IOfficialFeedbackOnReactedInitiativeNotificationData: IOfficialFeedbackOnReactedInitiativeNotificationData;
  IOfficialFeedbackOnYourIdeaNotificationData: IOfficialFeedbackOnYourIdeaNotificationData;
  IOfficialFeedbackOnYourInitiativeNotificationData: IOfficialFeedbackOnYourInitiativeNotificationData;
  IProjectModerationRightsReceivedNotificationData: IProjectModerationRightsReceivedNotificationData;
  IProjectPhaseStartedNotificationData: IProjectPhaseStartedNotificationData;
  IProjectPhaseUpcomingNotificationData: IProjectPhaseUpcomingNotificationData;
  IStatusChangeOfYourIdeaNotificationData: IStatusChangeOfYourIdeaNotificationData;
  IStatusChangeOfYourInitiativeNotificationData: IStatusChangeOfYourInitiativeNotificationData;
  IStatusChangeOnCommentedIdeaNotificationData: IStatusChangeOnCommentedIdeaNotificationData;
  IStatusChangeOnCommentedInitiativeNotificationData: IStatusChangeOnCommentedInitiativeNotificationData;
  IStatusChangeOnReactedIdeaNotificationData: IStatusChangeOnReactedIdeaNotificationData;
  IStatusChangeOnReactedInitiativeNotificationData: IStatusChangeOnReactedInitiativeNotificationData;
  IThresholdReachedForAdminNotificationData: IThresholdReachedForAdminNotificationData;
  IProjectFolderModerationRightsReceivedNotificationData: IProjectFolderModerationRightsReceivedNotificationData;
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
