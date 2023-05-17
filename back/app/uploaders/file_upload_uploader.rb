# frozen_string_literal: true

class FileUploadUploader < IdeaFileUploader
  def extension_allowlist
    # All file types are allowed.
  end
end
