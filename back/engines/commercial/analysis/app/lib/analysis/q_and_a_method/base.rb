# frozen_string_literal: true

module Analysis
  class QAndAMethod::Base
    attr_reader :analysis, :task, :question, :input_to_text

    Q_AND_A_METHOD_CLASSES = [
      QAndAMethod::OnePassLLM
    ]

    LLMS = [
      LLM::GPT48k.new,
      LLM::GPT432k.new,
      LLM::GPT3516k.new
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
      @input_to_text = InputToText.new(@analysis.custom_fields)
    end

    def execute(plan)
      task.set_in_progress!
      question.update!(accuracy: plan.accuracy)
      question.insight.update!(inputs_ids: filtered_inputs.ids)

      begin
        run(plan)
        task.set_succeeded!
      rescue QAndAFailedError => e
        ErrorReporter.report(e)
        task.set_failed!
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
      LLM::OpenAIGPT.token_count(str)
    end
  end
end
