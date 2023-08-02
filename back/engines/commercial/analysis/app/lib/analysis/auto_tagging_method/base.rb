# frozen_string_literal: true

module Analysis
  class AutoTaggingMethod::Base
    attr_reader :analysis, :task, :input_to_text

    class AutoTaggingFailedError < StandardError; end

    def self.for_auto_tagging_method auto_tagging_method, *params
      case auto_tagging_method
      when 'controversial'
        AutoTaggingMethod::Controversial.new(*params)
      when 'platform_topic'
        AutoTaggingMethod::PlatformTopic.new(*params)
      when 'sentiment'
        AutoTaggingMethod::Sentiment.new(*params)
      else
        raise ArgumentError, "Unsupported auto_tagging_method #{auto_tagging_method}"
      end
    end

    def initialize(auto_tagging_task)
      @analysis = auto_tagging_task.analysis
      @task = auto_tagging_task
      @input_to_text = InputToText.new(@analysis.custom_fields)
    end

    def execute
      task.set_in_progress!
      begin
        run
        task.set_succeeded!
      rescue AutoTaggingFailedError => e
        ErrorReporter.report(e)
        task.set_failed!
      end
    end

    protected

    def update_progress(progress)
      task.update!(progress: progress)
    end

    def deduct_locale(input)
      input.author&.locale ||
        input.title_multiloc&.keys&.first ||
        input.body_multiloc&.keys&.first ||
        AppConfiguration.instance.settings('core', 'locales').first
    end
  end
end
