module Files
  class GeneratePreviewJob < ::ApplicationJob
    queue_as :default

    def run(preview)
      PreviewService.new.generate_preview_content(preview)
      ic error_count
    rescue StandardError => e
      if error_count >= (self.class.maximum_retry_count - 1)
        ErrorReporter.report(
          e,
          extra: {
            file_id: preview.file.id,
            file_name: preview.file.name,
            file_content_type: preview.file.content.content_type
          }
        )
        preview.update!(status: 'failed')
      end
    end
  end
end
