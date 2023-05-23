# frozen_string_literal: true

class IdeaFileUploader < BaseFileUploader
  def extension_allowlist
    %w[avi csv doc docx key mkv mp3 mp4 numbers odp ods odt pages pdf ppt pptx txt xls xlsx]
  end

  def size_range
    (1.byte)..(50.megabytes)
  end

  def store_dir
    # In case IdeaFileUploader is used for FileUpload,
    # still use the "idea_file" directory.binding.pry
    super.sub('/file_upload/', '/idea_file/')
  end
end
