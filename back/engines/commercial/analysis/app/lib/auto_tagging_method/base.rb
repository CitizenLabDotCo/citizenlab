# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Base
    attr_reader :analysis

    class AutoTaggingFailedError < StandardError; end

    def self.for_auto_tagging_method auto_tagging_method, *params
      case auto_tagging_method
      when 'controversial'
        AutoTaggingMethod::Controversial.new(*params)
      else
        raise ArgumentError, "Unsupported auto_tagging_method #{auto_tagging_method}"
      end
    end

    def initialize(analysis, auto_tagging_task)
      @analysis = analysis
      @task = auto_tagging_task
    end

    def execute
      @task.set_in_progress!
      begin
        run
        @task.set_succeeded!
      rescue AutoTaggingFailedError => _e
        @task.set_failed!
      end
    end

    protected

    def update_progress(progress)
      @task.update!(progress: progress)
    end
  end
end
