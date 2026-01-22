module IdeaFeed
  class TopicModelingJob < ApplicationJob
    queue_as :default
    self.priority = 70 # low priority

    def perform(phase)
      IdeaFeed::TopicModelingService.new(phase).rebalance_topics!
      IdeaFeed::TopicClassificationService.new(phase).classify_all_inputs_in_background!
    end
  end
end
