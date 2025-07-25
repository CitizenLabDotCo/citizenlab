module Files
  class GeneratePreviewJob < ::ApplicationJob
    queue_as :default

    def run(preview)
      PreviewService.new.generate_preview_content(preview)
    rescue StandardError => e
      if error_count >= (self.class.maximum_retry_count - 1)
        preview.update!(status: 'failed')
      end
      raise e
    end
  end
end
