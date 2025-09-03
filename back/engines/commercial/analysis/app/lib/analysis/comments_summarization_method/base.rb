# frozen_string_literal: true

module Analysis
  class CommentsSummarizationMethod::Base
    attr_reader :analysis, :task, :comments_summary, :llm

    class SummarizationFailedError < StandardError; end
    class TooManyInputs < SummarizationFailedError; end

    def initialize(comments_summary, *_args, **kwargs)
      @comments_summary = comments_summary
      @task = comments_summary.background_task
      @analysis = comments_summary.analysis
      @llm = kwargs[:llm] || LLM::GPT41.new
    end

    def execute
      task.set_in_progress!
      comments_summary.update!(
        summary: '',
        comments_ids: comments.ids,
        accuracy: llm.accuracy
      )
      begin
        run
        task.set_succeeded!
      rescue SummarizationFailedError => e
        ErrorReporter.report(e)
        task.set_failed!
      end
    end

    def run
      raise NotImplementedError
    end

    protected

    def comments
      comments_summary.comments
    end

    def update_progress(progress)
      task.update!(progress: progress)
    end

    def update_summary(new_summary)
      comments_summary.update(summary: new_summary)
    end
  end
end
