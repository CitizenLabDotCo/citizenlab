module Files
  class PreviewService
    def initialize
      @gotenberg = GotenbergClient.new
    end

    # Enqueues a job to generate a preview for the given Files::File
    def enqueue_preview(file)
      return unless should_generate_preview?(file)

      preview = file.create_preview!
      GeneratePreviewJob.perform_later(preview)
    end

    # Called by the GeneratePreviewJob to generate the preview content PDF
    def generate_preview_content(preview)
      binary_file_content = StringIO.new(preview.file.content.read)
      temp_file = @gotenberg.render_libreoffice_to_pdf(binary_file_content, preview.file.content.content_type, preview.name)
      preview.content = temp_file
      preview.status = 'completed'
      preview.save!
    end

    def should_generate_preview?(file)
      @gotenberg.supported_by_libreoffice?(file.name) && file.content.file.extension.downcase != 'pdf'
    end
  end
end
