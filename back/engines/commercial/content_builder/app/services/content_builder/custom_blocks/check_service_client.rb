# frozen_string_literal: true

module ContentBuilder
  module CustomBlocks
    # Talks to the check service, the container that compiles and checks generated
    # blocks. Modelled on {GotenbergClient}: a sidecar reached over HTTP, with a health
    # probe and errors the caller can act on.
    #
    # There is no JavaScript toolchain in this process, and generated JavaScript must
    # not run in it either, which is why this is a network call rather than a library.
    class CheckServiceClient
      DEFAULT_TIMEOUT_SECONDS = 60
      OPEN_TIMEOUT_SECONDS = 5
      SECRET_HEADER = 'X-Check-Secret'

      class Error < StandardError; end

      # The service is down, unreachable, or refusing work. Distinct from a build that
      # ran and failed: the model can fix its source, it cannot fix our deployment.
      class Unavailable < Error; end

      def initialize(timeout: DEFAULT_TIMEOUT_SECONDS)
        @api_url = ENV.fetch('CHECK_SERVICE_URL', 'http://check_service:3100')
        @secret = ENV.fetch('CHECK_SERVICE_SECRET', nil)
        @timeout = timeout
      end

      # @return [Hash] the service's build result, with string keys.
      # @raise [Unavailable]
      def build(source:, manifest:, messages:, locales:)
        raise Unavailable, 'CHECK_SERVICE_SECRET is not configured.' if @secret.blank?

        response = connection.post('/build') do |request|
          request.body = {
            source: source,
            manifest: manifest,
            messages: messages,
            locales: locales
          }.to_json
        end

        unless response.success?
          raise Unavailable, "The check service responded with #{response.status}: #{response.body.to_s.truncate(200)}"
        end

        JSON.parse(response.body)
      rescue Faraday::Error => e
        raise Unavailable, "The check service is unreachable: #{e.class}"
      rescue JSON::ParserError
        raise Unavailable, 'The check service returned a response that is not JSON.'
      end

      def up?
        connection.get('/health').success?
      rescue StandardError
        false
      end

      private

      def connection
        @connection ||= Faraday.new(@api_url) do |f|
          f.headers['Content-Type'] = 'application/json'
          f.headers[SECRET_HEADER] = @secret.to_s
          f.options.timeout = @timeout
          f.options.open_timeout = OPEN_TIMEOUT_SECONDS
          f.adapter :net_http
        end
      end
    end
  end
end
