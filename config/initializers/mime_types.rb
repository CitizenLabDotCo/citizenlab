# Be sure to restart your server when you modify this file.

# Add new mime types for use in respond_to blocks:
# Mime::Type.register "text/richtext", :rtf

MIME::Types.add(
  MIME::Type.new('application/x-ms-dos-executable').tap do |type|
    type.add_extensions 'exe'
  end
)
MIME::Types.add(
  # When uploading .ppt files such as ./spec/fixtures/david.ppt,
  # carrierwave-base64 sometimes guesses application/x-ole-storage
  # as MIME type but crashes because it doesn't "know" the MIME type.
  MIME::Type.new('application/x-ole-storage').tap do |type|
    type.add_extensions 'ppt'
  end
)