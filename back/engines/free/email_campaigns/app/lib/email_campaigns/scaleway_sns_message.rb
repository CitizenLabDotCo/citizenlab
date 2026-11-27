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

    SIGNATURE_KEYS = %w[Signature SignatureVersion SigningCertURL].freeze

    # Hash algorithm for each SNS SignatureVersion.
    DIGESTS = { '1' => 'SHA1', '2' => 'SHA256' }.freeze

    # A signing certificate is ~1.2 KiB (2048-bit RSA); refuse anything suspiciously large
    # before parsing it.
    MAX_CERTIFICATE_BYTES = 64 * 1024 # = 64 KiB
    CERTIFICATE_CACHE_TTL = 1.day

    # TEM is currently only available in one region.
    REGION = 'fr-par'

    # Scaleway doesn't really document where signing certificates are served from, or
    # guarantee it. This host is what its docs suggest and what we observed in our tests.
    # A certificate is trusted because of the CA chain, not because of this host. We still
    # pin it, because we don't want the application fetching arbitrary URLs.
    CERTIFICATE_HOST = "messaging.s3.#{REGION}.scw.cloud"

    class << self
      attr_writer :trust_chain_path, :expected_topic_arn

      # Parses the request body and verifies the envelope, so an instance is always
      # authenticated and only holds signed or checked fields.
      #
      # @param raw_body [String] the request body as received; the signature covers the
      #   exact `Message` string, so it must not be re-serialised.
      # @return [ScalewaySnsMessage]
      # @raise [InvalidMessage] when the body isn't an SNS envelope, doesn't come from the
      #   expected topic, or can't be authenticated.
      def parse!(raw_body)
        envelope = JSON.parse(raw_body)
        raise InvalidMessage, 'body is not a JSON object' unless envelope.is_a?(Hash)

        new(envelope).tap(&:verify!)
      rescue JSON::ParserError
        raise InvalidMessage, 'body is not JSON'
      end

      def trust_chain_path
        @trust_chain_path || Engine.root.join('config', 'scaleway_sns_trust_chain', "#{REGION}.pem")
      end

      # The only topic envelopes are accepted from. If it's not set, every envelope is refused.
      def expected_topic_arn
        @expected_topic_arn || ENV.fetch('SCW_TEM_TOPIC_ARN', nil)
      end
    end

    # Use `parse!` instead, which parses and verifies in one go.
    private_class_method :new

    # Once verified, only the signed fields and the signature material are left in it.
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
    # @return [Hash, nil] the parsed event, or nil for other message types
    # @raise [InvalidMessage] when `Message` is not a JSON object
    def event
      # `Message` holds the TEM event as a JSON string for a `Notification`, but a plain
      # sentence for the other envelope types.
      return unless type == 'Notification'

      @event ||= JSON.parse(envelope['Message'].to_s).tap do |event|
        raise InvalidMessage, 'Message is not a JSON object' unless event.is_a?(Hash)
      end
    rescue JSON::ParserError
      raise InvalidMessage, 'Message is not JSON'
    end

    # @return [String, nil] the confirmation URL of a `SubscriptionConfirmation` message,
    #   or nil for other message types
    def subscribe_url = envelope['SubscribeURL']

    # Authenticates the envelope, then drops every field that is neither covered by the
    # signature nor part of it (`UnsubscribeURL`, unknown fields), so that only
    # authenticated data can be read afterwards.
    #
    # @raise [InvalidMessage] when the envelope doesn't come from the expected topic or
    #  can't be authenticated.
    def verify!
      raise InvalidMessage, "unsupported Type #{type.inspect}" unless SIGNED_KEYS.key?(type)

      # Checked before fetching the certificate, so a message from the wrong topic costs no
      # outbound request.
      verify_topic!

      digest = DIGESTS[envelope['SignatureVersion'].to_s]
      raise InvalidMessage, 'unsupported SignatureVersion' unless digest

      valid = signing_certificate.public_key.verify(digest, decoded_signature, string_to_sign)
      raise InvalidMessage, 'signature does not verify' unless valid

      @envelope = envelope.slice(*SIGNED_KEYS[type], *SIGNATURE_KEYS).freeze
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

    def decoded_signature
      Base64.strict_decode64(envelope['Signature'].to_s)
    rescue ArgumentError
      raise InvalidMessage, 'Signature is not base64'
    end

    def signing_certificate
      url = envelope['SigningCertURL'].to_s

      # Only certificates that passed the CA chain check are cached, so a cache hit is trusted.
      pem = Rails.cache.fetch("scaleway_sns_certificate/#{url}", expires_in: CERTIFICATE_CACHE_TTL) do
        fetch_and_validate_certificate(url)
      end

      OpenSSL::X509::Certificate.new(pem)
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
      unless https_url_on?(url, CERTIFICATE_HOST)
        raise InvalidMessage, 'SigningCertURL is not a Scaleway certificate URL'
      end

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

    # Whether `url` is an https url on that host, on the default port.
    def https_url_on?(url, host)
      uri = URI.parse(url)
      uri.is_a?(URI::HTTPS) && uri.host == host && uri.port == 443
    rescue URI::InvalidURIError
      false
    end
  end
end
