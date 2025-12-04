# frozen_string_literal: true

module Files
  # A restricted file model that blocks SVG uploads for security.
  # Used for files attached to ideas and custom field file uploads.
  # Uses the same 'files' table as Files::File but with a more restrictive uploader.
  class RestrictedFile < File
    # Use the same table as Files::File - no separate table needed
    self.table_name = 'files'

    # Override to use the restricted uploader that blocks SVG
    mount_base64_file_uploader :content, IdeaFileUploader
  end
end
