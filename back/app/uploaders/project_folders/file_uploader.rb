# frozen_string_literal: true

module ProjectFolders
  class FileUploader < BaseFileUploader
    def extension_allowlist
      %w[avi csv doc docx key mkv mp3 mp4 numbers odp ods odt pages pdf ppt pptx txt xls xlsx]
    end

    def size_range
      (1.byte)..(50.megabytes)
    end
  end
end
