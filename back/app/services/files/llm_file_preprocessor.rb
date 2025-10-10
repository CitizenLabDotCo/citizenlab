module Files
  # Service to preprocess files for use with LLMs, converting them into formats that are
  # better supported whenever possible. Most of the heavy lifting is handled by the
  # +PreviewService+ which converts the majority of files to PDF.
  class LLMFilePreprocessor
    # Yields the preprocessed file content to the block. If no preprocessing is needed,
    # the original file content is passed. A block is used to ensure that any temporary
    # files are properly closed and deleted after the block exits.
    #
    # @yield [source] The preprocessed file content
    # @yieldparam [Tempfile, BaseFileUploader] source The preprocessed file content
    def with_preprocessed_file_content(file, &)
      preprocessed_file = preprocess_file(file)
      source = preprocessed_file.is_a?(Tempfile) ? preprocessed_file.path : preprocessed_file.full_url
      yield source
    ensure
      preprocessed_file.close! if preprocessed_file.is_a?(Tempfile)
    end

    # @return [Tempfile, BaseFileUploader]
    def preprocess_file(file)
      if file.text?
        file.content
      elsif file.image?
        preprocess_image(file)
      elsif previewable_as_pdf?(file)
        preprocess_previewable_as_pdf(file)
      else # rubocop:disable Lint/DuplicateBranch
        file.content
      end
    end

    # @return [Tempfile, BaseFileUploader]
    def preprocess_previewable_as_pdf(file)
      preview = file.preview

      if preview.content.full_url.present?
        preview.content
      elsif preview.status == 'pending'
        raise PreviewPendingError
      elsif preview.status == 'failed' && docx?(file)
        docx_to_html(file)
      else
        # Just return the file content as is. It will most likely be rejected by the LLM
        # unless support for additional file types is added. The alternative is to raise
        # an error directly.
        file.content
      end
    end

    # @return [Tempfile] Tempfile with HTML content
    def docx_to_html(file)
      Tempfile.open do |local_file|
        local_file.binmode.write(file.content.read)
        doc = Docx::Document.open(local_file.path)

        Tempfile
          .new([file.name, '.html'])
          .tap { |processed_file| processed_file.write(doc.to_html) }
      end
    end

    # @return [Tempfile, BaseFileUploader]
    def preprocess_image(file)
      if file.size < 10.megabytes
        file.content
      elsif file.size > 50.megabytes
        # For now, we don't want to risk overloading our server (disk space and CPU) by
        # processing large images.
        raise ImageSizeLimitExceededError, "Max size is 50MB, but the file is #{file.size} bytes."
      else
        resize_image(file)
      end
    end

    # @return [Tempfile] Tempfile with resized image
    def resize_image(file, max_dim: 1000)
      Tempfile.create do |local_file|
        local_file.binmode.write(file.content.read)
        image = MiniMagick::Image.open(local_file.path)
        image.width > image.height ? image.resize("#{max_dim}x") : image.resize("x#{max_dim}")
        image.tempfile
      end
    end

    def previewable_as_pdf?(file)
      PreviewService.new.should_generate_preview?(file)
    end

    def docx?(file)
      file.content.content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        # Adding the loose check for the file extension bc docx exported by some tools (Google Docs) don't have
        # the correct content type.
        file.name.rpartition('.').last == 'docx'
    end

    class PreviewPendingError < StandardError; end
    class ImageSizeLimitExceededError < StandardError; end
  end
end
