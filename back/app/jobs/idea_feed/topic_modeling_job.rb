module IdeaFeed
  class TopicModelingJob < ApplicationJob
    queue_as :default
    self.priority = 70 # low priority

    def perform(phase)
      service = IdeaFeed::LiveClusteringService.new(phase)
      service.rebalance_topics!
      service.classify_all_inputs_in_background!
    end
  end
end
