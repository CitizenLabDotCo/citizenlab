# frozen_string_literal: true

class WebApi::V1::Notifications::BasketSubmittedSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :project_title_multiloc do |object|
    # TODO: Is there already a helper function for this?
    project = basket.participation_context.phase? ? basket.participation_context.project : basket.participation_context
    object.project&.title_multiloc
  end
end
