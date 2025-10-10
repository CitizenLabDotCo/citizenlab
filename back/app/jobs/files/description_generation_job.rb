# frozen_string_literal: true

module Files
  # Background job for generating AI-powered file descriptions.
  class DescriptionGenerationJob < ApplicationJob
    include Jobs::TrackableJob

    # Set priority to 45 (slightly more important than emails at 50)
    # This matches the priority used by other analysis jobs in the system
    self.priority = 45

    # @param file [Files::File] The file to generate descriptions for
    def perform(file)
      Files::DescriptionGenerator.new.generate_descriptions!(file)
      mark_as_complete!
    end

    private

    UNRECOVERABLE_ERRORS = [
      RubyLLM::UnsupportedAttachmentError,
      RubyLLM::BadRequestError,
      LLMFilePreprocessor::ImageSizeLimitExceededError
    ].freeze

    def handle_error(error)
      case error
      when LLMFilePreprocessor::PreviewPendingError then retry_in(30.seconds)
      when *UNRECOVERABLE_ERRORS then expire
      else super
      end
    end

    def expire
      # TODO: Improve the tracker interface to make this simpler.
      track_progress(1, 1)
      mark_as_complete!
      super
    end

    def job_tracking_context
      arguments.first.tap do |file|
        raise "Expected file, got #{file.class}" unless file.is_a?(Files::File)
      end
    end
  end
end
