# frozen_string_literal: true

class FileUpload < IdeaFile
  private

  def extension_whitelist
    # Do nothing. All file types are allowed.
  end
end
