# frozen_string_literal: true

module Files
  # Uploader for files attached to ideas and custom field file uploads.
  # Blocks SVG files due to XSS security risks (SVG can contain embedded JavaScript).
  # For admin-uploaded files (projects, events), use the standard FileUploader instead.
  class IdeaFileUploader < FileUploader
    def extension_allowlist
      # Inherit parent's allowlist and explicitly remove SVG
      super&.tap { |list| list&.reject! { |ext| ext == 'svg' } } ||
        (BaseFileUploader.new.extension_allowlist - ['svg'])
    end

    def content_type_allowlist
      # Also block SVG MIME type
      super&.reject { |type| type == 'image/svg+xml' }
    end
  end
end
