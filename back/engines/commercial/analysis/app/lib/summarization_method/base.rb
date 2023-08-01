# frozen_string_literal: true

module Analysis
  class SummarizationMethod::Base
    attr_reader :analysis, :task, :summary

    class SummarizationFailedError < StandardError; end

    def self.for_summarization_method summarization_method, *params
      case summarization_method
      when 'gpt4'
        SummarizationMethod::Gpt4.new(*params)
      when 'bogus'
        SummarizationMethod::Bogus.new(*params)
      else
        raise ArgumentError, "Unsupported summarization_method #{summarization_method}"
      end
    end

    def initialize(summarization_task)
      @analysis = summarization_task.analysis
      @task = summarization_task
      @summary = summarization_task.summary
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
