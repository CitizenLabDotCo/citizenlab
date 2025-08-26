# frozen_string_literal: true

module Files
  class FileUploader < BaseFileUploader
    after :store, :generate_descriptions
    after :store, :generate_preview
    after :store, :transcribe

    def generate_descriptions(_file)
      Files::DescriptionGenerator.enqueue_job(model)
    end

    def generate_preview(_file)
      Files::PreviewService.new.enqueue_preview(model)
    end

    def transcribe(_file)
      # There seems to be no way to skip these callbacks in tests, so we skip
      # them in test environment to prevent the file factories from running
      # them.
      return if Rails.env.test?
      return unless AppConfiguration.instance.feature_activated?('data_repository_transcription')

      Files::TranscriptService.new(model).enqueue_transcript
    end

    def extension_allowlist
      # All file types are allowed.
    end

    def size_range
      # TODO: Not sure this scales up to 100 MB
      (1.byte)..(100.megabytes)
    end
  end
end
