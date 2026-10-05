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
      # A render drives a real browser and waits for the block's data; the service's
      # own timeout is 30s, so this sits above it.
      RENDER_TIMEOUT_SECONDS = 90
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

      # Mounts a block, or a whole report, in a real browser and reports what happened.
      #
      # @param target [Hash] {kind: 'block', bundle:, manifest:, messages:, config:}
      #   or {kind: 'layout', craftjs_json:}.
      # @return [Hash] the service's render result, with string keys.
      # @raise [Unavailable]
      def render(target:, locale:, layout_id:, app_origin:, token:, api_origin: nil, screenshot: true)
        raise Unavailable, 'CHECK_SERVICE_SECRET is not configured.' if @secret.blank?

        response = render_connection.post('/render') do |request|
          request.body = {
            target: target,
            locale: locale,
            layoutId: layout_id,
            appOrigin: app_origin,
            apiOrigin: api_origin,
            token: token,
            screenshot: screenshot
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

      # The SDK's type declarations, from the copy the typechecker checks blocks
      # against, so the prompt describes the same module the compiler enforces.
      def sdk_declarations
        raise Unavailable, 'CHECK_SERVICE_SECRET is not configured.' if @secret.blank?

        response = connection.get('/sdk/v1.d.ts')
        unless response.success?
          raise Unavailable, "The check service responded with #{response.status} for the SDK declarations."
        end

        response.body.to_s
      rescue Faraday::Error => e
        raise Unavailable, "The check service is unreachable: #{e.class}"
      end

      def up?
        connection.get('/health').success?
      rescue StandardError
        false
      end

      private

      def render_connection
        @render_connection ||= build_connection(RENDER_TIMEOUT_SECONDS)
      end

      def connection
        @connection ||= build_connection(@timeout)
      end

      def build_connection(timeout)
        Faraday.new(@api_url) do |f|
          f.headers['Content-Type'] = 'application/json'
          f.headers[SECRET_HEADER] = @secret.to_s
          f.options.timeout = timeout
          f.options.open_timeout = OPEN_TIMEOUT_SECONDS
          f.adapter :net_http
        end
      end
    end
  end
end
