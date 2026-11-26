# frozen_string_literal: true

require 'open3'

class BaseImageUploader < BaseUploader
  include CarrierWave::MiniMagick

  ALLOWED_TYPES = %w[jpg jpeg gif png webp avif]
  # Cameras often save at 90+, which is much bigger for no visible gain. Only ever lowered.
  JPEG_MAX_QUALITY = 80
  # For originals served as they are. Camera photos can be 5000px+ wide, and no page
  # shows an image wider than this, even on high-density screens.
  MAX_SIZE = 2400

  # Using process at the class level applies it to all versions, including the original.
  process :strip

  # from https://github.com/carrierwaveuploader/carrierwave/wiki/how-to:-create-random-and-unique-filenames-for-all-versioned-files#unique-filenames
  def filename
    "#{secure_token}.#{file.extension}"
  end

  def content_type_allowlist
    ALLOWED_TYPES.map { "image/#{_1}" }
  end

  def extension_allowlist
    ALLOWED_TYPES
  end

  def url(*)
    CarrierwaveTempRemote.url(identifier, version_name) || super
  end

  # Some servers send the wrong Content-Type: Facebook serves JPEG profile pictures as
  # image/avif. When the URL has no extension, CarrierWave takes it from that header,
  # and exiftool refuses to strip a file whose extension doesn't match its content.
  # Only the filename needs fixing: CarrierWave takes the content type from the file's
  # bytes first, so the wrong header value passed on here doesn't win.
  def download!(uri, remote_headers = {})
    remote_file = downloader.new(self).download(uri, remote_headers)
    cache!(
      tempfile: remote_file.file,
      filename: filename_matching_content(remote_file),
      content_type: remote_file.content_type
    )
  end

  # Lower the JPEG quality in the resize itself, so the image is only saved once.
  def resize_to_fill(width, height, gravity = 'Center', combine_options: {}, &)
    super(width, height, gravity, combine_options: jpeg_quality_options.merge(combine_options), &)
  end

  def resize_to_limit(width, height, combine_options: {}, &)
    super(width, height, combine_options: jpeg_quality_options.merge(combine_options), &)
  end

  protected

  def secure_token
    var = :"@#{mounted_as}_secure_token"
    model.instance_variable_get(var) or model.instance_variable_set(var, SecureRandom.uuid)
  end

  # How a resize saves each format (only JPEGs get a quality here):
  # - JPEG: keeps the source's quality, capped at JPEG_MAX_QUALITY.
  # - PNG: stays lossless (often logos or graphics, where lossy compression shows).
  # - WebP: lossy files don't store their quality, so libwebp saves at its default
  #   of 75. Lossless stays lossless.
  # - AVIF: our ImageMagick can't write AVIF, so it saves JPEG data under the .avif
  #   name, without the quality cap. Browsers still show it.
  def jpeg_quality_options
    return {} unless jpeg? && ::MiniMagick::Image.new(current_path)['%Q'].to_i > JPEG_MAX_QUALITY

    { quality: JPEG_MAX_QUALITY }
  end

  def limit_size
    width, height = ::MiniMagick::Image.new(current_path).dimensions
    return if width <= MAX_SIZE && height <= MAX_SIZE

    if @file.content_type == 'image/gif'
      gif_safe_transform! { |img| img.resize "#{MAX_SIZE}x#{MAX_SIZE}>" }
    else
      resize_to_limit(MAX_SIZE, MAX_SIZE)
    end
  end

  def jpeg?
    %w[image/jpeg image/jpg].include?(@file.content_type)
  end

  # Only renames to an extension we accept. Anything else keeps its name and is left to the
  # allowlist and exiftool: Marcel reads some AVIFs (major brand mif1) as HEIF, and renaming
  # those to .heif would get them rejected.
  def filename_matching_content(remote_file)
    filename = remote_file.original_filename
    extensions = Marcel::Magic.by_magic(remote_file.file)&.extensions || []
    return filename if extensions.include?(File.extname(filename).delete_prefix('.').downcase)

    extension = extensions.find { extension_allowlist.include?(_1) }
    extension ? "#{File.basename(filename, '.*')}.#{extension}" : filename
  end

  # Modified from https://vivianbrown.net/blog/cropping-gifs.html
  def safe_resize_to_fill_for_gif(width, height)
    if @file.content_type == 'image/gif'
      gif_safe_transform! do |img|
        resize_to_fill_using_convert(img, width, height)
      end
    else
      resize_to_fill(width, height)
    end
  end

  def gif_safe_transform!
    MiniMagick::Tool::Convert.new do |image| # Calls imagemagick's 'convert' command
      image << @file.path
      image.coalesce # Remove optimizations so each layer shows the full image.

      yield image

      image.layers 'Optimize' # Re-optimise, or the coalesced GIF grows several times.
      image << @file.path
    end
  end

  def resize_to_fill_using_convert(img, target_width, target_height, gravity = 'Center')
    current_image = MiniMagick::Image.open(@file.path)
    current_width = current_image.width
    current_height = current_image.height
    if target_width != current_width || target_height != current_height
      scale_x = target_width / current_width.to_f
      scale_y = target_height / current_height.to_f
      if scale_x >= scale_y
        current_width = (scale_x * (current_width + 0.5)).round
        current_height = (scale_x * (current_height + 0.5)).round
        img.resize current_width
      else
        current_width = (scale_y * (current_width + 0.5)).round
        current_height = (scale_y * (current_height + 0.5)).round
        img.resize "x#{current_height}"
      end
    end
    img.gravity gravity
    img.background 'rgba(255,255,255,0.0)'
    img.extent "#{target_width}x#{target_height}" if current_width != target_width || current_height != target_height
  end

  # Strip the image of EXIF metadata, except ICC color profile, orientation,
  # and essential technical/structural metadata.
  def strip
    command = 'exiftool'
    args = [
      '-all=',
      '-tagsFromFile', '@',
      '-icc_profile',
      '-orientation',
      '-overwrite_original',
      @file.path
    ]

    stdout, stderr, status = Open3.capture3(command, *args)

    unless status.success?
      ErrorReporter.report_msg(
        'Exiftool command failed during image stripping.',
        extra: {
          file_path: @file.path,
          exiftool_command: "#{command} #{args.join(' ')}",
          exiftool_stdout: stdout,
          exiftool_stderr: stderr,
          exiftool_exit_status: status.exitstatus,
          exiftool_error_signal: status.termsig
        }
      )
      # CarrierWave's mount turns a ProcessingError into a validation error on the record.
      raise CarrierWave::ProcessingError
    end
  end
end
