# frozen_string_literal: true

module CitizenLab
  class CloudfrontUrlSigner
    def initialize(key_pair_id: nil, private_key: nil)
      @key_pair_id = key_pair_id || ENV.fetch('CLOUDFRONT_KEY_PAIR_ID')

      private_key_content = private_key ||
                            ENV['CLOUDFRONT_PRIVATE_KEY']&.gsub('\n', "\n").presence ||
                            File.read(ENV.fetch('CLOUDFRONT_PRIVATE_KEY_PATH'))

      @signer = Aws::CloudFront::UrlSigner.new(
        key_pair_id: @key_pair_id,
        private_key: private_key_content
      )
    rescue KeyError
      raise MissingConfigurationError
    end

    def sign_url(url, expires_in: 1.month)
      @signer.signed_url(url, expires: stable_expiry(url, expires_in))
    end

    class MissingConfigurationError < StandardError
      def initialize(message = 'CloudFront key pair ID or private key not found')
        super
      end
    end

    private

    # Browsers cache files by their full URL, signature included, so a URL signed
    # with a new expiry on every request is never served from the browser cache.
    # Rounding the expiry up to the next day keeps the URL the same for a day.
    # Each URL moves on to its next day at a different time, so that browsers don't
    # fetch every file again at the same moment.
    def stable_expiry(url, expires_in)
      day = 1.day.to_i
      offset = Zlib.crc32(url) % day
      earliest = (Time.current + expires_in).to_i

      (((earliest - offset + day - 1) / day) * day) + offset
    end
  end
end
