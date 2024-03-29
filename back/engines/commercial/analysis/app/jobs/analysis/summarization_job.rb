# frozen_string_literal: true

module Analysis
  class SummarizationJob < ApplicationJob
    self.priority = 45 # Slighltly more important than emails (50)

    def run(summary)
      # even though the plan was normally already generated once in
      # summaries#create, we generate it again since the inputs might have
      # changed between enqueueing and executing this job
      plan = SummarizationMethod::Base.plan(summary)

      summarization_method = plan.summarization_method_class.new(summary)
      summarization_method.execute(plan)
    end
  end
end
