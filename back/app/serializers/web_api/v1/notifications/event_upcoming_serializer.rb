# frozen_string_literal: true

class WebApi::V1::Notifications::EventUpcomingSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :event_id do |object|
    object.event&.id
  end

  attribute :event_title_multiloc do |object|
    object.event&.title_multiloc
  end

  attribute :event_start_at do |object|
    object.event&.start_at
  end

  attribute :project_slug do |object|
    object.project&.slug
  end

  attribute :project_title_multiloc do |object|
    object.project&.title_multiloc
  end
end
