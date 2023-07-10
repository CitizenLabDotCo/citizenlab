# frozen_string_literal: true

class WebApi::V1::Notifications::BasketSubmittedSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :project_title_multiloc do |object|
    object.project&.title_multiloc
  end
end
