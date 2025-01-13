# frozen_string_literal: true

class WebApi::V1::Notifications::ProjectReviewRequestSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :project_id do |object|
    object.project_review&.project_id
  end

  attribute :project_title_multiloc do |object|
    object.project_review&.project&.title_multiloc
  end

  attribute :initiating_user_first_name do |object|
    object.initiating_user&.first_name
  end

  attribute :initiating_user_last_name do |object, params|
    UserDisplayNameService
      .new(AppConfiguration.instance, current_user(params))
      .last_name!(object.initiating_user)
  end

  attribute :initiating_user_slug do |object|
    object.initiating_user&.slug
  end
end
