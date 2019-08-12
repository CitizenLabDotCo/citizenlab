class WebApi::V1::Notifications::OfficialFeedbackOnYourInitiativeSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :initiating_user_first_name do |object|
    object.initiating_user&.first_name
  end

  attribute :initiating_user_last_name do |object|
    object.initiating_user&.last_name
  end

  attribute :initiating_user_slug do |object|
    object.initiating_user&.slug
  end

  attribute :initiative_title do |object|
    object.initiative&.title_multiloc
  end

  attribute :official_feedback_author do |object|
    object.official_feedback&.author_multiloc
  end

  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :initiative, serializer: WebApi::V1::InitiativeSerializer
  belongs_to :official_feedback, serializer: WebApi::V1::OfficialFeedbackSerializer
end
