class WebApi::V1::Notifications::IdeaMarkedAsSpamSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :initiating_user_first_name do |object|
    object.initiating_user&.first_name
  end

  attribute :initiating_user_last_name do |object, params|
    name_service = UserDisplayNameService.new(AppConfiguration.instance, current_user(params))
    name_service.last_name!(object.initiating_user)
  end

  attribute :initiating_user_slug do |object|
    object.initiating_user&.slug
  end

  attribute :post_title_multiloc do |object|
    object.post&.title_multiloc
  end

  attribute :post_slug do |object|
    object.post&.slug
  end
end
