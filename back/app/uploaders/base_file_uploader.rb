# frozen_string_literal: true

class BaseFileUploader < BaseUploader
  def extension_allowlist
    %w[avi csv doc docx key mkv mp3 mp4 numbers odp ods odt pages pdf ppt pptx txt xls xlsx] +
      BaseImageUploader::ALLOWED_TYPES
  end

  def fog_attributes
    # Browsers render XML documents inline and run the script in them, so XML files
    # (also KML, GPX) are downloaded instead.
    disposition = file&.content_type.to_s.match?(%r{[/+]xml\z}) ? 'attachment' : 'inline'
    # Deleting consecutive whitespaces in filename because of
    # https://github.com/fog/fog-aws/issues/160
    super.merge('Content-Disposition' => "#{disposition}; filename=\"#{model.name.strip.gsub(/\s+/, ' ')}\"")
  end
end
