class NotificationService
  NOTIFICATION_CLASSES = [
    Notifications::AdminRightsReceived, 
    Notifications::CommentDeletedByAdmin, 
    Notifications::CommentMarkedAsSpam, 
    Notifications::CommentOnYourComment, 
    Notifications::CommentOnYourIdea, 
    Notifications::CommentOnYourInitiative, 
    Notifications::IdeaMarkedAsSpam, 
    Notifications::InitiativeAssignedToYou, 
    Notifications::InitiativeMarkedAsSpam, 
    Notifications::InviteAccepted, 
    Notifications::MentionInComment, 
    Notifications::MentionInOfficialFeedback, 
    Notifications::OfficialFeedbackOnCommentedIdea, 
    Notifications::OfficialFeedbackOnCommentedInitiative, 
    Notifications::OfficialFeedbackOnVotedIdea, 
    Notifications::OfficialFeedbackOnVotedInitiative, 
    Notifications::OfficialFeedbackOnYourIdea, 
    Notifications::OfficialFeedbackOnYourInitiative, 
    Notifications::ProjectModerationRightsReceived, 
    Notifications::ProjectPhaseStarted, 
    Notifications::ProjectPhaseUpcoming, 
    Notifications::StatusChangeOfYourIdea, 
    Notifications::StatusChangeOfYourInitiative, 
    Notifications::StatusChangeOnCommentedIdea, 
    Notifications::StatusChangeOnCommentedInitiative, 
    Notifications::StatusChangeOnVotedIdea, 
    Notifications::StatusChangeOnVotedInitiative, 
    Notifications::ThresholdReachedForAdmin 
  ].freeze

  def notification_classes
    NOTIFICATION_CLASSES
  end

  def classes_for activity
    notification_classes.select do |klaz|
      klaz::ACTIVITY_TRIGGERS.dig(activity.item_type, activity.action)
    end
  end

  def serializers
    notification_classes.map do |klaz|
      module_prefix = klaz.name.split(/Notifications\:\:/, 2).first # After https://stackoverflow.com/a/7523966/3585671
      [klaz, "#{module_prefix}WebApi::V1::Notifications::#{klaz.name.demodulize}Serializer".constantize]
    end.to_h
  end
end

NotificationService.prepend_if_ee('FlagInappropriateContent::Patches::NotificationService')
NotificationService.prepend_if_ee('IdeaAssignment::Patches::NotificationService')
NotificationService.prepend_if_ee('ProjectFolders::Patches::NotificationService')
