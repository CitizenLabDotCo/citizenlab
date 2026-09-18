# frozen_string_literal: true

# Gzip text responses (JSON API, HTML, CSV, ...). API requests go from CloudFront
# through the load balancer straight to Puma, and neither CloudFront (caching is
# disabled for these paths) nor the load balancer compresses them.
#
# Responses that are already compressed (PDF, xlsx, images, ...) are skipped.
# `sync: false` because we don't stream responses, and flushing after every chunk
# hurts the compression ratio.
compressible_content_type = %r{\A(text/|application/(json|vnd\.api\+json|javascript|xml))}

Rails.application.config.middleware.insert_after Rack::Sendfile, Rack::Deflater,
  sync: false,
  if: lambda { |_env, _status, headers, _body|
    content_length = headers['Content-Length']

    headers['Content-Type'].to_s.match?(compressible_content_type) &&
      (content_length.nil? || content_length.to_i > 1024)
  }

# Rack::Deflater has no option for the compression level and always uses zlib's
# default (6). Level 1 (BEST_SPEED) is only ~10-20% larger on our JSON responses
# for a fraction of the CPU.
module RackDeflaterBestSpeed
  # Copy of Rack::Deflater::GzipStream#each (rack 2.2), with the compression level
  # set. Revisit when upgrading rack.
  def each(&block)
    @writer = block
    gzip = ::Zlib::GzipWriter.new(self, ::Zlib::BEST_SPEED)
    gzip.mtime = @mtime if @mtime
    @body.each do |part|
      # Skip empty strings, as they would result in no output, and flushing empty
      # parts would raise Zlib::BufError.
      next if part.empty?

      gzip.write(part)
      gzip.flush if @sync
    end
  ensure
    gzip&.close
  end
end

Rack::Deflater::GzipStream.prepend(RackDeflaterBestSpeed)
