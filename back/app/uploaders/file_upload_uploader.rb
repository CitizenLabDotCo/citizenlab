# frozen_string_literal: true

class FileUploadUploader < IdeaFileUploader
  def extension_allowlist
    SafeUploadAllowlist::EXTENSIONS
  end

  def content_type_allowlist
    SafeUploadAllowlist::CONTENT_TYPES
  end
end
