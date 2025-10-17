# frozen_string_literal: true

class Analysis::WebApi::V1::BackgroundTaskSerializer < WebApi::V1::BaseSerializer
  attributes :progress, :state, :started_at, :ended_at, :updated_at, :created_at, :type, :auto_tagging_method

  attribute :type do |background_task|
    background_task.task_type
  end

  attribute :failure_reason do |background_task|
    map_error_class_to_reason(background_task.last_error_class)
  end

  def self.map_error_class_to_reason(error_class_name)
    case error_class_name
    when 'Analysis::LLM::UnsupportedAttachmentError', 'RubyLLM::UnsupportedAttachmentError', 'RubyLLM::BadRequestError'
      'unsupported_file_type'
    when 'Files::LLMFilePreprocessor::ImageSizeLimitExceededError'
      'input_too_large'
    when 'Analysis::LLM::TooManyRequestsError'
      'rate_limit_exceeded'
    when 'Analysis::LLM::PreviewPendingError', 'Files::LLMFilePreprocessor::PreviewPendingError'
      'file_preview_failed'
    when nil
      nil
    else
      # Log unmapped errors for monitoring
      ErrorReporter.report_msg(
        'Unmapped error class in BackgroundTask',
        extra: { error_class: error_class_name }
      )
      'unknown'
    end
  end
end
