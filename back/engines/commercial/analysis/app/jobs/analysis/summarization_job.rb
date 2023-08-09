# frozen_string_literal: true

module Analysis
  class SummarizationJob < ApplicationJob
    queue_as :default

    def run(summarization_task)
      sm = SummarizationMethod::Base.for_summarization_method(summarization_task.summary.summarization_method, summarization_task)
      sm.execute
    end
  end
end
