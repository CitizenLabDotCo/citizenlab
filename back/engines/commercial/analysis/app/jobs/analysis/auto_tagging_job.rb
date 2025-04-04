# frozen_string_literal: true

module Analysis
  class AutoTaggingJob < ApplicationJob
    self.priority = 45 # Slighltly more important than emails (50)

    def run(auto_tagging_task)
      auto_tagging_task.execute
      HeatmapGenerationJob.perform_later(auto_tagging_task.analysis)
    end
  end
end
