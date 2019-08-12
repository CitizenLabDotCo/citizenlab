class WebApi::V1::Notifications::InitiativeAssignedToYouSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :initiating_user_first_name do |object|
    object.initiating_user&.first_name
  end

  attribute :initiating_user_last_name do |object|
    object.initiating_user&.last_name
  end

  attribute :initiating_user_slug do |object|
    object.initiating_user&.slug
  end

  attribute :initiative_title_multiloc do |object|
    object.initiative&.title_multiloc
  end

  attribute :initiative_slug do |object|
    object.initiative&.slug
  end

  belongs_to :initiating_user, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :initiative, serializer: WebApi::V1::InitiativeSerializer
end
