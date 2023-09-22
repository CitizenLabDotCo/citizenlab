# frozen_string_literal: true

module Analysis
  class SummarizationMethod::Base
    attr_reader :analysis, :task, :summary, :input_to_text

    SUMMARIZATION_METHOD_CLASSES = [
      SummarizationMethod::OnePassLLM
    ]

    LLMS = [
      LLM::GPT48k.new,
      LLM::GPT432k.new,
      LLM::GPT3516k.new
    ]

    class SummarizationFailedError < StandardError; end
    class TooManyInputs < SummarizationFailedError; end

    def self.plan(summary)
      SummarizationMethod::OnePassLLM.new(summary).generate_plan || SummarizationPlan.new(
        impossible_reason: :too_many_inputs
      )
    end

    def initialize(summary, *_args, **_kwargs)
      @summary = summary
      @task = summary.background_task
      @analysis = summary.analysis
      @input_to_text = InputToText.new(@analysis.custom_fields)
    end

    def execute(plan)
      task.set_in_progress!
      summary.update!(accuracy: plan.accuracy)
      summary.insight.update!(inputs_ids: filtered_inputs.ids)
      begin
        run(plan)
        task.set_succeeded!
      rescue SummarizationFailedError => e
        ErrorReporter.report(e)
        task.set_failed!
      end
    end

    # Should be implemente by subclasses and return a SummarizationPlan or nil
    def generate_plan
      raise NotImplementedError
    end

    protected

    def filtered_inputs
      @filtered_inputs ||= InputsFinder.new(analysis, summary.filters.symbolize_keys).execute
    end

    def update_progress(progress)
      task.update!(progress: progress)
    end

    def update_summary(new_summary)
      summary.update(summary: new_summary)
    end

    def enabled_llms
      LLMS.select(&:enabled?)
    end

    # What is the maximum context window any of the LLMs support?
    def max_context_window
      enabled_llms.map(&:context_window).max
    end

    # For now, we assume GPT tokenization for all llms
    def token_count(str)
      LLM::OpenAIGPT.token_count(str)
    end
  end
end
