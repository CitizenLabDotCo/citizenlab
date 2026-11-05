module IdeaFeed
  class TopicModelingJob < ApplicationJob
    queue_as :default
    self.priority = 70 # low priority

    def perform(project)
      IdeaFeed::TopicModelingService.new(project).rebalance_topics!
      IdeaFeed::TopicClassificationService.new(project).classify_all_inputs_in_background!
    end
  end
end
