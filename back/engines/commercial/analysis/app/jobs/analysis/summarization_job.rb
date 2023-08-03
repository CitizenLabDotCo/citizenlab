# frozen_string_literal: true

module Analysis
  class SummarizationJob < ApplicationJob
    queue_as :default

    def run(summarization_task)
      summarization_task.execute
    end
  end
end
