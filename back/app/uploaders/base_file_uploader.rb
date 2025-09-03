# frozen_string_literal: true

class BaseFileUploader < BaseUploader
  def extension_allowlist
    %w[avi csv doc docx key mkv mp3 mp4 numbers odp ods odt pages pdf ppt pptx txt xls xlsx] +
      BaseImageUploader::ALLOWED_TYPES
  end

  def fog_attributes
    # Deleting consecutive whitespaces in filename because of
    # https://github.com/fog/fog-aws/issues/160
    { 'Content-Disposition' => "inline; filename=\"#{model.name.strip.gsub(/\s+/, ' ')}\"" }
  end
end
