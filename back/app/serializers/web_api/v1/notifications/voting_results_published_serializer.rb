# frozen_string_literal: true

class WebApi::V1::Notifications::VotingResultsPublishedSerializer < WebApi::V1::Notifications::NotificationSerializer
  attribute :project_slug do |object|
    object.project&.slug
  end

  attribute :phase_title_multiloc do |object|
    object.phase&.title_multiloc
  end
end
