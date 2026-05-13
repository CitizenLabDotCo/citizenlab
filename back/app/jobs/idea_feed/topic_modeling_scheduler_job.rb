# frozen_string_literal: true

module IdeaFeed
  # Applies the topic modeling scheduler for all relevant projects in the
  # current tenant
  class TopicModelingSchedulerJob < ApplicationJob
    queue_as :default
    self.priority = 70 # low priority

    def perform
      projects_with_topic_modeling_enabled.each do |project|
        TopicModelingScheduler.new(project).on_every_hour
      end
    end

    # Returns all projects for which topic modeling could be scheduled
    def projects_with_topic_modeling_enabled
      Project
        .joins(:admin_publication)
        .where(live_auto_input_topics_enabled: true)
        .merge(AdminPublication.published)
    end
  end
end
