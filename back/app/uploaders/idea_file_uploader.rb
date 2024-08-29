# frozen_string_literal: true

class IdeaFileUploader < BaseFileUploader
  def size_range
    (1.byte)..(50.megabytes)
  end

  def store_dir
    # In case IdeaFileUploader is used for FileUpload,
    # still use the "idea_file" directory.
    super.sub('/file_upload/', '/idea_file/')
  end
end
