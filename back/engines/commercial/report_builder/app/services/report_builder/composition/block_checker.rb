# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Renders a block, or the whole report, in a real browser and turns what came
    # back into something the model can act on.
    #
    # A build answers "does this compile". Only a render answers "does this draw
    # anything" — a chart can be valid TypeScript, mount cleanly and still paint an
    # empty frame because its dataKey does not match a column, and no amount of type
    # checking sees that.
    class BlockChecker
      Unavailable = ContentBuilder::CustomBlocks::SandboxClient::Unavailable

      # Lines of console output and failed requests are capped: one noisy block must
      # not crowd the rest of the run out of the transcript.
      MAX_LINES = 8

      # The provider refuses an image over this on either side, and it refuses the
      # whole request with it — so a picture that size is never sent.
      MAX_IMAGE_SIDE_PX = 8000

      def initialize(layout:, author:, locale:, client: nil)
        @layout = layout
        @author = author
        @locale = locale
        @client = client || ContentBuilder::CustomBlocks::SandboxClient.new
      end

      # @param target [Hash] what to mount, in the sandbox's shape.
      # @return [Hash] { text:, error:, screenshot: } — a tool outcome.
      def check(target, screenshot: false)
        return unavailable('There is no report to check yet.') if @layout.nil?

        result = @client.render(
          target: target,
          locale: @locale,
          layout_id: @layout.id,
          app_origin: app_origin,
          api_origin: api_origin,
          token: token,
          screenshot: true
        )

        summarize(result, screenshot: screenshot)
      rescue Unavailable => e
        unavailable("The renderer is not available right now (#{e.message}). Carry on without it.")
      end

      def block_target(bundle:, manifest:, messages:, config: {})
        { kind: 'block', bundle: bundle, manifest: manifest, messages: messages, config: config }
      end

      def layout_target(craftjs_json)
        { kind: 'layout', craftjs_json: craftjs_json }
      end

      private

      def unavailable(text)
        { error: true, text: text, screenshot: nil }
      end

      def token
        ContentBuilder::ScopedReportingToken.mint(layout_id: @layout.id, user_id: @author&.id)
      end

      def app_origin
        AppConfiguration.instance.base_frontend_uri
      end

      # Where the page fetches its data and its uploads from. The same host as the app
      # in production; a second port in development, which the browser would otherwise
      # refuse as a private address.
      def api_origin
        AppConfiguration.instance.base_backend_uri
      end

      # Failures first and in full; what passed is one line, because a model that is
      # told at length what already works will spend a round admiring it.
      def summarize(result, screenshot:)
        checks = result['checks'] || []
        failed = checks.reject { |entry| entry['ok'] }

        lines = []
        lines << (failed.empty? ? 'Everything checked out.' : "#{failed.size} check(s) failed:")
        failed.each { |entry| lines << "- #{entry['id']}: #{entry['message']}" }
        lines.concat(detail_lines(result))

        # The picture goes to the model when a check failed and it cannot say what is
        # wrong, or when the model asked to see it.
        picture = sendable_screenshot(result['screenshot']) if failed.any? || screenshot
        if picture
          lines << 'The screenshot shows the top of the report; it is taller than a picture can be.' if result['screenshotClipped']
        elsif (failed.any? || screenshot) && result['screenshot'].present?
          lines << 'The screenshot was too large to send.'
        end

        { error: failed.any?, text: lines.join("\n"), screenshot: picture }
      end

      # The PNG's own header says how big it is; a picture a side over the limit is
      # dropped rather than handed to a provider that will refuse the whole turn.
      def sendable_screenshot(base64)
        return nil if base64.blank?

        width, height = Base64.strict_decode64(base64)[16, 8]&.unpack('N2')
        return nil if width.nil? || height.nil? || width > MAX_IMAGE_SIDE_PX || height > MAX_IMAGE_SIDE_PX

        base64
      rescue ArgumentError
        nil
      end

      def detail_lines(result)
        lines = []
        errors = Array(result['errors']).first(MAX_LINES)
        console = Array(result['console']).first(MAX_LINES)
        requests = Array(result['failedRequests']).first(MAX_LINES)

        lines << "Errors: #{errors.join(' | ')}" if errors.any?
        lines << "Console: #{console.join(' | ')}" if console.any?
        if requests.any?
          lines << "Failed requests: #{requests.map { |r| "#{r['url']} (#{r['reason']})" }.join(' | ')}"
        end
        lines
      end
    end
  end
end
