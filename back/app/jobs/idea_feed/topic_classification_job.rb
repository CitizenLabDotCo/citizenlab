module IdeaFeed
  class TopicClassificationJob < ApplicationJob
    queue_as :default
    self.priority = 70 # low priority

    def perform(phase, idea)
      service = IdeaFeed::TopicClassificationService.new(phase)
      service.classify_topics!(idea)
    end
  end
end
