# frozen_string_literal: true

module Base64Helper
  def png_image_as_base64(filename)
    file_as_base64 filename, 'image/png'
  end

  def file_as_base64(filename, mime_type)
    "data:#{mime_type};base64,#{Base64.encode64(Rails.root.join('spec', 'fixtures', filename).read)}"
  end
end
