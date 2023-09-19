# frozen_string_literal: true

module Analysis
  class AutoTaggingJob < ApplicationJob
    queue_as :default

    def run(auto_tagging_task)
      auto_tagging_task.execute
    end
  end
end
