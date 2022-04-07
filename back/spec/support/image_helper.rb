module ImageHelper
  def encode_image_as_base64(filename)
    "data:image/png;base64,#{Base64.encode64(File.read(Rails.root.join('spec', 'fixtures', filename)))}"
  end
end
