# frozen_string_literal: true

class NotificationService
  NOTIFICATION_CLASSES = [
    Notifications::AdminRightsReceived,
    Notifications::CommentDeletedByAdmin,
    Notifications::CommentMarkedAsSpam,
    Notifications::CommentOnYourComment,
    Notifications::CommentOnIdeaYouFollow,
    Notifications::CommentOnInitiativeYouFollow,
    Notifications::CosponsorOfYourInitiative,
    Notifications::CosponsorOfYourIdea,
    Notifications::IdeaMarkedAsSpam,
    Notifications::InitiativeAssignedToYou,
    Notifications::InitiativeMarkedAsSpam,
    Notifications::InitiativeResubmittedForReview,
    Notifications::InternalComments::InternalCommentOnIdeaAssignedToYou,
    Notifications::InternalComments::InternalCommentOnIdeaYouCommentedInternallyOn,
    Notifications::InternalComments::InternalCommentOnIdeaYouModerate,
    Notifications::InternalComments::InternalCommentOnInitiativeAssignedToYou,
    Notifications::InternalComments::InternalCommentOnInitiativeYouCommentedInternallyOn,
    Notifications::InternalComments::InternalCommentOnUnassignedInitiative,
    Notifications::InternalComments::InternalCommentOnUnassignedUnmoderatedIdea,
    Notifications::InternalComments::InternalCommentOnYourInternalComment,
    Notifications::InvitationToCosponsorInitiative,
    Notifications::InvitationToCosponsorIdea,
    Notifications::InviteAccepted,
    Notifications::MentionInComment,
    Notifications::InternalComments::MentionInInternalComment,
    Notifications::MentionInOfficialFeedback,
    Notifications::OfficialFeedbackOnIdeaYouFollow,
    Notifications::OfficialFeedbackOnInitiativeYouFollow,
    Notifications::ProjectFolderModerationRightsReceived,
    Notifications::ProjectModerationRightsReceived,
    Notifications::ProjectPhaseStarted,
    Notifications::ProjectPhaseUpcoming,
    Notifications::ProjectPublished,
    Notifications::StatusChangeOnIdeaYouFollow,
    Notifications::StatusChangeOnInitiativeYouFollow,
    Notifications::ThresholdReachedForAdmin,
    Notifications::VotingBasketSubmitted,
    Notifications::NativeSurveyNotSubmitted,
    Notifications::VotingBasketNotSubmitted,
    Notifications::VotingLastChance,
    Notifications::VotingResultsPublished
  ].freeze

  def notification_classes
    NOTIFICATION_CLASSES
  end

  def classes_for(activity)
    notification_classes.select do |klaz|
      klaz::ACTIVITY_TRIGGERS.dig(activity.item_type, activity.action)
    end
  end

  def serializers
    notification_classes.to_h do |klaz|
      module_prefix = klaz.name.split(/Notifications::/, 2).first # After https://stackoverflow.com/a/7523966/3585671
      [klaz, "#{module_prefix}WebApi::V1::Notifications::#{klaz.name.demodulize}Serializer".constantize]
    end
  end
end

NotificationService.prepend(FlagInappropriateContent::Patches::NotificationService)
NotificationService.prepend(IdeaAssignment::Patches::NotificationService)
