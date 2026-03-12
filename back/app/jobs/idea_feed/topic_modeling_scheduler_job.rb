module IdeaFeed
  # Applies the topic modeling scheduler for all relevant phases in the current
  # tenant
  class TopicModelingSchedulerJob < ApplicationJob
    queue_as :default
    self.priority = 70 # low priority

    def perform
      phases_with_topic_modeling_enabled.each do |phase|
        TopicModelingScheduler.new(phase).on_every_hour
      end
    end

    # Returns all phases for which topic modeling could be scheduled
    def phases_with_topic_modeling_enabled
      Phase
        .joins(:project)
        .where(projects: { live_auto_input_topics_enabled: true })
        .current
        .filter { |phase| phase.pmethod.supports_input_topics? }
    end
  end
end
