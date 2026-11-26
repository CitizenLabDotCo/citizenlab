# frozen_string_literal: true

module EmailCampaigns
  # ActionMailer delivery method for Scaleway Transactional Email (TEM), through its REST API.
  # Registered as `:scaleway_tem` by the engine.
  class ScalewayTemDeliveryMethod
    API_URL = 'https://api.scaleway.com'
    DEFAULT_REGION = 'fr-par'

    # Every header except these is forwarded to TEM as `additional_headers`.
    STRUCTURAL_HEADERS = [
      'from', 'to', 'cc', 'bcc', 'subject', # dedicated fields in the API payload
      'date', 'message-id', # normally still unset at this point; written by TEM when it builds the message
      'mime-version', 'content-type', 'content-transfer-encoding' # describe the body as rendered here; TEM rebuilds it from `text` and `html`
    ].freeze

    class Error < StandardError
      attr_reader :status, :body

      def initialize(message, status: nil, body: nil)
        super(message)
        @status = status
        @body = body
      end
    end

    # Worth retrying: rate limiting, server errors, network failures.
    class TransientError < Error; end

    # Not worth retrying as is: invalid request, authentication, blocked recipient...
    class PermanentError < Error; end

    attr_reader :settings

    # @param settings [Hash] the `scaleway_tem_settings` ActionMailer configuration
    # @option settings [String] :secret_key IAM API key secret, sent as `X-Auth-Token`;
    #   the key needs the `TransactionalEmailEmailFullAccess` permission set on the project
    # @option settings [String] :project_id Project owning the sending domain
    # @option settings [String] :region ('fr-par') TEM region
    # @option settings [String] :api_url ('https://api.scaleway.com') API base URL
    # @raise [ArgumentError] when `secret_key` or `project_id` is missing
    def initialize(settings)
      @settings = settings

      %i[secret_key project_id].each do |key|
        raise ArgumentError, "scaleway_tem_settings requires `#{key}`" if settings[key].blank?
      end
    end

    def deliver!(mail)
      response = connection.post(emails_path, payload(mail))
      raise error_for(response) unless response.success?

      response
    rescue Faraday::ConnectionFailed, Faraday::TimeoutError, Faraday::SSLError => e
      raise TransientError, e.message
    end

    private

    def connection
      url = settings[:api_url] || API_URL
      headers = { 'X-Auth-Token' => settings[:secret_key] }

      # Some mail is sent with `deliver_now` inside a web request, so a slow API must not
      # hold the thread for Net::HTTP's default minute.
      request = { open_timeout: 5, timeout: 10 } # seconds to connect / to get the response

      Faraday.new(url:, headers:, request:) do |f|
        f.request :json
        f.response :json
      end
    end

    def emails_path
      region = settings[:region] || DEFAULT_REGION
      "/transactional-email/v1alpha1/regions/#{region}/emails"
    end

    def payload(mail)
      {
        project_id: settings[:project_id],
        from: addresses(mail[:from]).first,
        to: addresses(mail[:to]),
        cc: addresses(mail[:cc]),
        bcc: addresses(mail[:bcc]),
        subject: mail.subject,
        text: body_part(mail, 'text/plain'),
        html: body_part(mail, 'text/html'),
        attachments: attachments(mail),
        additional_headers: additional_headers(mail)
      }.compact_blank
    end

    def addresses(field)
      return [] unless field

      field.addrs.map { |addr| { email: addr.address, name: addr.display_name }.compact }
    end

    def body_part(mail, mime_type)
      part = if mail.multipart?
        mail.find_first_mime_type(mime_type)
      elsif mail.mime_type == mime_type
        mail
      end

      part&.decoded
    end

    def attachments(mail)
      mail.attachments.map do |attachment|
        {
          name: attachment.filename,
          type: attachment.mime_type,
          content: Base64.strict_encode64(attachment.body.decoded)
        }
      end
    end

    def additional_headers(mail)
      mail.header_fields
        .reject { |field| STRUCTURAL_HEADERS.include?(field.name.downcase) }
        .map { |field| { key: field.name, value: field.value } }
    end

    def error_for(response)
      body = response.body.is_a?(Hash) ? response.body : {}

      transient =
        [408, 429].include?(response.status) ||
        response.status >= 500 ||
        body['type'] == 'transient_state_error' # Scaleway's "resource busy, retry later"

      klass = transient ? TransientError : PermanentError
      message = body['message'] || response.body
      klass.new("Scaleway TEM responded #{response.status}: #{message}", status: response.status, body: response.body)
    end
  end
end
