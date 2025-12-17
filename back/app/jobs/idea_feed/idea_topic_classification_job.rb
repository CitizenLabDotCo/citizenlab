module IdeaFeed
  class IdeaTopicClassificationJob < ApplicationJob
    queue_as :default
    self.priority = 70 # low priority

    def perform(phase, idea)
      service = IdeaFeed::LiveClusteringService.new(phase)
      service.classify_topics!(idea)
    end
  end
end
