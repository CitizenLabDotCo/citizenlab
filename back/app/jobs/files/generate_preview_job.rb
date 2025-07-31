module Files
  class GeneratePreviewJob < ::ApplicationJob
    queue_as :default

    def run(preview)
      PreviewService.new.generate_preview_content(preview)
    rescue StandardError
      if error_count >= (maximum_retry_count - 1)
        preview.update!(status: 'failed')
      end
      raise
    end
  end
end
