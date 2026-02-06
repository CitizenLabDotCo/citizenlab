# frozen_string_literal: true

module IdeaFeed
  class BatchTopicClassificationJob < ApplicationJob
    queue_as :default
    self.priority = 70 # low priority

    def perform(phase, idea_ids)
      ideas = Idea.where(id: idea_ids)
      service = IdeaFeed::TopicClassificationService.new(phase)
      service.classify_parallel_batch(ideas)
    end
  end
end
