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
      expires_at = Time.now + expires_in
      @signer.signed_url(url, expires: expires_at)
    end

    class MissingConfigurationError < StandardError
      def initialize(message = 'CloudFront key pair ID or private key not found')
        super
      end
    end
  end
end
