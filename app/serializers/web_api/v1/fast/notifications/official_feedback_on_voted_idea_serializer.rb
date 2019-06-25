class WebApi::V1::Fast::Notifications::OfficialFeedbackOnVotedIdeaSerializer < WebApi::V1::Fast::Notifications::NotificationSerializer
  attribute :initiating_user_first_name do |object|
    object.initiating_user&.first_name
  end

  attribute :initiating_user_last_name do |object|
    object.initiating_user&.last_name
  end

  attribute :initiating_user_slug do |object|
    object.initiating_user&.slug
  end

  attribute :idea_title do |object|
    object.idea&.title_multiloc
  end

  attribute :official_feedback_author do |object|
    object.official_feedback&.author_multiloc
  end

  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::Fast::UserSerializer
  belongs_to :idea, serializer: WebApi::V1::Fast::IdeaSerializer
  belongs_to :official_feedback, serializer: WebApi::V1::Fast::OfficialFeedbackSerializer
  belongs_to :project, serializer: WebApi::V1::Fast::ProjectSerializer
end
