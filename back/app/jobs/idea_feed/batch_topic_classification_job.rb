# frozen_string_literal: true

module IdeaFeed
  class BatchTopicClassificationJob < ApplicationJob
    queue_as :default
    self.priority = 70 # low priority

    def perform(project, idea_ids)
      ideas = Idea.where(id: idea_ids)
      service = IdeaFeed::TopicClassificationService.new(project)
      service.classify_parallel_batch(ideas)
    end
  end
end
