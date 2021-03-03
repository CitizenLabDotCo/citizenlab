class NotificationToSerializerMapper
  include Callable
  extend ClassMethods

  self.notification_serializer_map = {
    ::Notifications::AdminRightsReceived => WebApi::V1::Notifications::AdminRightsReceivedSerializer,
    ::Notifications::CommentDeletedByAdmin => WebApi::V1::Notifications::CommentDeletedByAdminSerializer,
    ::Notifications::CommentMarkedAsSpam => WebApi::V1::Notifications::CommentMarkedAsSpamSerializer,
    ::Notifications::CommentOnYourComment => WebApi::V1::Notifications::CommentOnYourCommentSerializer,
    ::Notifications::CommentOnYourIdea => WebApi::V1::Notifications::CommentOnYourIdeaSerializer,
    ::Notifications::CommentOnYourInitiative => WebApi::V1::Notifications::CommentOnYourInitiativeSerializer,
    ::Notifications::IdeaAssignedToYou => WebApi::V1::Notifications::IdeaAssignedToYouSerializer,
    ::Notifications::IdeaMarkedAsSpam => WebApi::V1::Notifications::IdeaMarkedAsSpamSerializer,
    ::Notifications::InitiativeAssignedToYou => WebApi::V1::Notifications::InitiativeAssignedToYouSerializer,
    ::Notifications::InitiativeMarkedAsSpam => WebApi::V1::Notifications::InitiativeMarkedAsSpamSerializer,
    ::Notifications::InviteAccepted => WebApi::V1::Notifications::InviteAcceptedSerializer,
    ::Notifications::MentionInComment => WebApi::V1::Notifications::MentionInCommentSerializer,
    ::Notifications::MentionInOfficialFeedback => WebApi::V1::Notifications::MentionInOfficialFeedbackSerializer,
    ::Notifications::OfficialFeedbackOnCommentedIdea => WebApi::V1::Notifications::OfficialFeedbackOnCommentedIdeaSerializer,
    ::Notifications::OfficialFeedbackOnCommentedInitiative => WebApi::V1::Notifications::OfficialFeedbackOnCommentedInitiativeSerializer,
    ::Notifications::OfficialFeedbackOnVotedIdea => WebApi::V1::Notifications::OfficialFeedbackOnVotedIdeaSerializer,
    ::Notifications::OfficialFeedbackOnVotedInitiative => WebApi::V1::Notifications::OfficialFeedbackOnVotedInitiativeSerializer,
    ::Notifications::OfficialFeedbackOnYourIdea => WebApi::V1::Notifications::OfficialFeedbackOnYourIdeaSerializer,
    ::Notifications::OfficialFeedbackOnYourInitiative => WebApi::V1::Notifications::OfficialFeedbackOnYourInitiativeSerializer,
    ::Notifications::ProjectModerationRightsReceived => WebApi::V1::Notifications::ProjectModerationRightsReceivedSerializer,
    ::Notifications::ProjectPhaseStarted => WebApi::V1::Notifications::ProjectPhaseStartedSerializer,
    ::Notifications::ProjectPhaseUpcoming => WebApi::V1::Notifications::ProjectPhaseUpcomingSerializer,
    ::Notifications::StatusChangeOfYourIdea => WebApi::V1::Notifications::StatusChangeOfYourIdeaSerializer,
    ::Notifications::StatusChangeOfYourInitiative => WebApi::V1::Notifications::StatusChangeOfYourInitiativeSerializer,
    ::Notifications::StatusChangeOnCommentedIdea => WebApi::V1::Notifications::StatusChangeOnCommentedIdeaSerializer,
    ::Notifications::StatusChangeOnCommentedInitiative => WebApi::V1::Notifications::StatusChangeOnCommentedInitiativeSerializer,
    ::Notifications::StatusChangeOnVotedIdea => WebApi::V1::Notifications::StatusChangeOnVotedIdeaSerializer,
    ::Notifications::StatusChangeOnVotedInitiative => WebApi::V1::Notifications::StatusChangeOnVotedInitiativeSerializer,
    ::Notifications::ThresholdReachedForAdmin => WebApi::V1::Notifications::ThresholdReachedForAdminSerializer
  }

  attr_reader :notification_class

  delegate :map, to: :class

  def initialize(notification_class)
    @notification_class = notification_class
  end

  def call
    map[notification_class]
  end

  module ClassMethods
    def map
      @map ||= {}
    end

    def add_set(notification_klass, serializer_klass)
      map[notification_klass] = serializer_klass
    end

    def notification_serializer_map=(hash_map)
      @map = hash_map
    end
  end
end
