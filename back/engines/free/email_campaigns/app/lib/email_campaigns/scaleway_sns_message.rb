# frozen_string_literal: true

module EmailCampaigns
  # A webhook request from Scaleway Topics and Events (the SNS-compatible service TEM publishes its
  # events through), parsed and authenticated.
  #
  # Verification follows the SNS recipe: the signing certificate is fetched from `SigningCertURL`,
  # checked against Scaleway's published CA chain (vendored in `config/scaleway_sns_trust_chain/`), and
  # its public key verifies the signature over the canonical string of the envelope. Certificates are
  # cached by URL.
  # See https://www.scaleway.com/en/docs/topics-and-events/reference-content/verifying-webhooks/
  #
  # A valid signature only proves the message came through Scaleway, not that it came from
  # us: any Scaleway customer can send signed messages from their own topic. So we only
  # accept messages from our own topic.
  class ScalewaySnsMessage
    class InvalidMessage < StandardError; end

    # Envelope keys covered by the signature, per type, in canonical order (the order in
    # which SNS concatenates them to build the string it signs).
    SIGNED_KEYS = {
      'Notification' => %w[Message MessageId Subject Timestamp TopicArn Type],
      'SubscriptionConfirmation' => %w[Message MessageId SubscribeURL Timestamp Token TopicArn Type]
    }.freeze

    # Hash algorithm for each SNS SignatureVersion.
    DIGESTS = { '1' => 'SHA1', '2' => 'SHA256' }.freeze

    # A signing certificate is ~1.2 KiB (2048-bit RSA); refuse anything suspiciously large
    # before parsing it.
    MAX_CERTIFICATE_BYTES = 64 * 1024 # = 64 KiB
    CERTIFICATE_CACHE_TTL = 1.day

    class << self
      attr_writer :region, :trust_chain_path, :expected_topic_arn

      # @param raw_body [String] the request body as received; the signature covers the exact
      #   `Message` string, so it must not be re-serialised.
      # @raise [InvalidMessage] when the body is not a well-formed, authentic SNS envelope
      def parse!(raw_body)
        envelope = JSON.parse(raw_body)
        raise InvalidMessage, 'body is not a JSON object' unless envelope.is_a?(Hash)

        new(envelope).tap(&:verify!)
      rescue JSON::ParserError
        raise InvalidMessage, 'body is not JSON'
      end

      def certificate_url_pattern
        esc_region = Regexp.escape(region)
        %r{\Ahttps://messaging\.s3\.#{esc_region}\.scw\.cloud/#{esc_region}/sns/[A-Za-z0-9_.-]+\.pem\z}
      end

      def subscribe_host
        "sns.mnq.#{region}.scaleway.com"
      end

      # Topics and Events hosts and CA chain depend on the region. TEM's region is the one
      # the topic is expected to live in.
      def region
        @region || ENV.fetch('SCW_TEM_REGION', 'fr-par')
      end

      def trust_chain_path
        @trust_chain_path || Engine.root.join('config', 'scaleway_sns_trust_chain', "#{region}.pem")
      end

      # The only topic envelopes are accepted from. If it's not set, every envelope is refused.
      def expected_topic_arn
        @expected_topic_arn || ENV.fetch('SCW_TEM_TOPIC_ARN', nil)
      end
    end

    attr_reader :envelope

    def initialize(envelope)
      @envelope = envelope
    end

    def type
      envelope['Type']
    end

    def topic_arn
      envelope['TopicArn']
    end

    # The TEM event carried by a `Notification`.
    #
    # @return [Hash] the parsed event
    # @raise [InvalidMessage] when `Message` is not valid JSON
    def event
      # `Message` holds the TEM event as a JSON string for a `Notification`, but a plain
      # sentence for the other envelope types.
      @event ||= JSON.parse(envelope['Message'].to_s)
    rescue JSON::ParserError
      raise InvalidMessage, 'Message is not JSON'
    end

    # @raise [InvalidMessage] unless the url points at Scaleway's SNS endpoint
    def subscribe_url
      url = envelope['SubscribeURL'].to_s

      uri = begin
        URI.parse(url)
      rescue URI::InvalidURIError
        nil
      end

      valid = uri&.scheme == 'https' && uri.host == self.class.subscribe_host && uri.query.present?
      raise InvalidMessage, 'SubscribeURL is not a Scaleway SNS confirmation URL' unless valid

      url
    end

    def verify!
      raise InvalidMessage, "unsupported Type #{type.inspect}" unless SIGNED_KEYS.key?(type)

      # Checked before fetching the certificate, so a message from the wrong topic costs no
      # outbound request.
      verify_topic!

      digest = DIGESTS[envelope['SignatureVersion'].to_s]
      raise InvalidMessage, 'unsupported SignatureVersion' unless digest

      certificate_url = envelope['SigningCertURL'].to_s
      unless certificate_url.match?(self.class.certificate_url_pattern)
        raise InvalidMessage, 'SigningCertURL is not a Scaleway certificate URL'
      end

      signature = decode_signature
      certificate = OpenSSL::X509::Certificate.new(certificate_pem(certificate_url))
      valid = certificate.public_key.verify(digest, signature, string_to_sign)
      raise InvalidMessage, 'signature does not verify' unless valid

      self
    end

    private

    def verify_topic!
      expected = self.class.expected_topic_arn
      raise InvalidMessage, 'no expected topic configured' if expected.blank?

      # `TopicArn` is covered by the signature.
      # The message is truncated: the signature hasn't been checked yet, so the value
      # could be anything, of any size. 350 leaves some margin over the longest possible
      # topic ARN, which is about 320 characters.
      if topic_arn != expected
        raise InvalidMessage, "unexpected TopicArn: #{topic_arn.to_s.truncate(350).inspect}"
      end
    end

    def string_to_sign
      SIGNED_KEYS[type].filter_map do |key|
        "#{key}\n#{envelope[key]}\n" unless envelope[key].nil?
      end.join
    end

    def decode_signature
      Base64.strict_decode64(envelope['Signature'].to_s)
    rescue ArgumentError
      raise InvalidMessage, 'Signature is not base64'
    end

    def certificate_pem(url)
      Rails.cache.fetch("scaleway_sns_certificate/#{url}", expires_in: CERTIFICATE_CACHE_TTL) do
        fetch_and_validate_certificate(url)
      end
    end

    def fetch_and_validate_certificate(url)
      certificate = OpenSSL::X509::Certificate.new(fetch_certificate(url))
      raise InvalidMessage, 'certificate is not issued by Scaleway' unless trust_store.verify(certificate)

      certificate.to_pem
    rescue OpenSSL::X509::CertificateError
      raise InvalidMessage, 'certificate is not a valid X.509 certificate'
    end

    # Streamed so an oversized response is cut off instead of buffered whole: raising from
    # `on_data` unwinds through `Net::HTTP#start`, which closes the connection.
    def fetch_certificate(url)
      body = +''
      response = Faraday.get(url) do |request|
        request.options.timeout = 5
        request.options.open_timeout = 5
        request.options.on_data = proc do |chunk, received_bytes|
          raise InvalidMessage, 'certificate is too large' if received_bytes > MAX_CERTIFICATE_BYTES

          body << chunk
        end
      end
      raise InvalidMessage, "certificate download failed (HTTP #{response.status})" unless response.success?

      body
    rescue Faraday::Error => e
      raise InvalidMessage, "certificate download failed (#{e.class})"
    end

    def trust_store
      OpenSSL::X509::Store.new.tap { |store| store.add_file(self.class.trust_chain_path.to_s) }
    end
  end
end
