# frozen_string_literal: true

class BaseFileUploader < BaseUploader
  # Browsers render XML documents (also KML, GPX, SVG) and run the scripts in them, so
  # these files are served as downloads. Media types are case-insensitive and may carry
  # parameters (`text/xml; charset=utf-8`). The CloudFront function on /uploads/* in
  # cl2-deployment (set_uploads_browser_cache.js) applies the same rule: keep them in sync.
  DOWNLOAD_ONLY_CONTENT_TYPE = %r{[/+]xml\s*(;|\z)}i

  def self.download_only?(content_type)
    content_type.to_s.match?(DOWNLOAD_ONLY_CONTENT_TYPE)
  end

  def extension_allowlist
    %w[avi csv doc docx key mkv mp3 mp4 numbers odp ods odt pages pdf ppt pptx txt xls xlsx] +
      BaseImageUploader::ALLOWED_TYPES
  end

  def fog_attributes
    disposition = self.class.download_only?(file&.content_type) ? 'attachment' : 'inline'
    # Deleting consecutive whitespaces in filename because of
    # https://github.com/fog/fog-aws/issues/160
    super.merge('Content-Disposition' => "#{disposition}; filename=\"#{model.name.strip.gsub(/\s+/, ' ')}\"")
  end
end
