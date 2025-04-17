# frozen_string_literal: true

module Analysis
  class SummarizationMethod::Base
    attr_reader :analysis, :task, :summary, :input_to_text

    SUMMARIZATION_METHOD_CLASSES = [
      SummarizationMethod::OnePassLLM
    ]

    LLMS = [
      LLM::GPT41.new,
      LLM::GPT4oMini.new
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
      @input_to_text = InputToText.new(@analysis.associated_custom_fields)
    end

    def execute(plan)
      task.set_in_progress!
      old_summary = summary.summary
      old_accuracy = summary.accuracy
      old_input_ids = summary.insight.inputs_ids
      old_custom_field_ids = summary.insight.custom_field_ids
      summary.update!(accuracy: plan.accuracy, summary: '')
      custom_field_ids = {
        main_custom_field_id: analysis.main_custom_field_id,
        additional_custom_field_ids: analysis.additional_custom_field_ids
      }
      summary.insight.update!(inputs_ids: filtered_inputs.ids, custom_field_ids: custom_field_ids)

      begin
        run(plan)
        task.set_succeeded!
      rescue SummarizationFailedError => e
        ErrorReporter.report(e)
        task.set_failed!
        summary.update!(accuracy: old_accuracy, summary: old_summary)
        summary.insight.update!(inputs_ids: old_input_ids, custom_field_ids: old_custom_field_ids)
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
      LLM::AzureOpenAI.token_count(str)
    end
  end
end
