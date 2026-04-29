# frozen_string_literal: true

# Shared extension and content-type allowlists for user-facing file upload
# surfaces (Files::FileUploader, FileUploadUploader). See TAN-7631.
#
# Defense layers:
#   - +EXTENSIONS+ is matched case-insensitively by CarrierWave against the
#     filename's last extension.
#   - +CONTENT_TYPES+ is matched against the MIME type Marcel sniffs from the
#     file's magic bytes during +before :cache+ — so a renamed payload
#     (e.g. payload.exe -> report.pdf) is still rejected.
#
# Both checks must pass.
module SafeUploadAllowlist
  EXTENSIONS = %w[
    pdf
    doc docx dot dotx
    xls xlsx xlt xltx
    ppt pptx pps ppsx pot potx
    odt ods odp odg
    pages numbers key
    rtf txt md csv tsv
    msg eml

    jpg jpeg jfif png gif webp avif bmp tif tiff heic heif

    mp3 m4a wav ogg oga flac aac opus amr

    mp4 m4v mov webm mkv avi

    zip 7z tar gz tgz bz2

    json geojson kml kmz gpx
    dwg dxf
    shp dbf shx prj
  ].freeze

  CONTENT_TYPES = [
    # Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    'application/vnd.openxmlformats-officedocument.presentationml.template',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    'application/vnd.oasis.opendocument.graphics',
    'application/vnd.apple.pages',
    'application/vnd.apple.numbers',
    'application/vnd.apple.keynote',
    'application/x-iwork-pages-sffpages',
    'application/x-iwork-numbers-sffnumbers',
    'application/x-iwork-keynote-sffkey',
    'application/rtf',
    'text/rtf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'text/tab-separated-values',
    'application/vnd.ms-outlook',
    'message/rfc822',

    # Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/bmp',
    'image/x-ms-bmp',
    'image/tiff',
    'image/heic',
    'image/heif',

    # Audio
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/flac',
    'audio/x-flac',
    'audio/aac',
    'audio/opus',
    'audio/amr',

    # Video
    'video/mp4',
    'video/x-m4v',
    'video/quicktime',
    'video/webm',
    'video/x-matroska',
    'video/x-msvideo',

    # Archives
    'application/zip',
    'application/x-zip-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-gzip',
    'application/x-bzip',
    'application/x-bzip2',

    # Geo / civic-engineering
    'application/json',
    'application/geo+json',
    'application/vnd.google-earth.kml+xml',
    'application/vnd.google-earth.kmz',
    'application/gpx+xml',
    'application/xml',
    'image/vnd.dwg',
    'image/vnd.dxf',
    'application/acad',

    # Catch-all for binary formats Marcel can't fingerprint (e.g. shapefile
    # sidecars: shp/dbf/shx/prj). Safety relies on the extension allowlist
    # rejecting these requests first if the extension isn't on the list — Marcel
    # resolves known-bad types like PE executables to application/x-msdownload,
    # not application/octet-stream.
    'application/octet-stream'
  ].freeze
end
