# frozen_string_literal: true

module Analysis
  class QAndAMethod::Base
    attr_reader :analysis, :task, :question, :input_to_text

    Q_AND_A_METHOD_CLASSES = [
      QAndAMethod::OnePassLLM
    ]

    LLMS = [
      LLM::GPT41.new,
      LLM::GPT4oMini.new
    ]

    class QAndAFailedError < StandardError; end
    class TooManyInputs < QAndAFailedError; end

    def self.plan(question)
      QAndAMethod::OnePassLLM.new(question).generate_plan || QAndAPlan.new(
        impossible_reason: :too_many_inputs
      )
    end

    def initialize(question, *_args, **_kwargs)
      @question = question
      @task = question.background_task
      @analysis = question.analysis
      @input_to_text = InputToText.new(@analysis.associated_custom_fields)
    end

    def execute(plan)
      task.set_in_progress!
      old_answer = question.answer
      old_accuracy = question.accuracy
      old_input_ids = question.insight.inputs_ids
      old_custom_field_ids = question.insight.custom_field_ids
      question.update!(accuracy: plan.accuracy, answer: '')
      custom_field_ids = {
        main_custom_field_id: analysis.main_custom_field_id,
        additional_custom_field_ids: analysis.additional_custom_field_ids
      }
      question.insight.update!(inputs_ids: filtered_inputs.ids, custom_field_ids: custom_field_ids)

      begin
        run(plan)
        task.set_succeeded!
      rescue QAndAFailedError => e
        ErrorReporter.report(e)
        task.set_failed!
        question.update!(accuracy: old_accuracy, answer: old_answer)
        question.insight.update!(inputs_ids: old_input_ids, custom_field_ids: old_custom_field_ids)
      end
    end

    # Should be implemente by subclasses and return a QAndAPlan or nil
    def generate_plan
      raise NotImplementedError
    end

    protected

    def filtered_inputs
      @filtered_inputs ||= InputsFinder.new(analysis, question.filters.symbolize_keys).execute
    end

    def update_progress(progress)
      task.update!(progress: progress)
    end

    def update_answer(new_answer)
      question.update(answer: new_answer)
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
