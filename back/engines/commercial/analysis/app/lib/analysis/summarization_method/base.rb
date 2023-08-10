# frozen_string_literal: true

module Analysis
  class SummarizationMethod::Base
    attr_reader :analysis, :task, :summary, :input_to_text

    class SummarizationFailedError < StandardError; end
    class TooManyInputs < SummarizationFailedError; end

    def self.for_summarization_method summarization_method, *params, **kwargs
      case summarization_method
      when 'gpt'
        SummarizationMethod::Gpt.new(*params, **kwargs)
      when 'bogus'
        SummarizationMethod::Bogus.new(*params, **kwargs)
      else
        raise ArgumentError, "Unsupported summarization_method #{summarization_method}"
      end
    end

    def initialize(summarization_task, *_args, **_kwargs)
      @analysis = summarization_task.analysis
      @task = summarization_task
      @summary = summarization_task.summary
      @input_to_text = InputToText.new(@analysis.custom_fields)
    end

    # Before calling `execute`, this method can be used to check whether the
    # method is able to process the request. Should return an instance of
    # Analysis::SummaryPreCheck
    def pre_check
      raise NotImplementedError
    end

    def execute
      task.set_in_progress!
      begin
        run
        task.set_succeeded!
      rescue SummarizationFailedError => e
        ErrorReporter.report(e)
        task.set_failed!
      end
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
  end
end
