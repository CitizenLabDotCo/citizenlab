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
      Unavailable = ContentBuilder::CustomBlocks::CheckServiceClient::Unavailable

      # Lines of console output and failed requests are capped: one noisy block must
      # not crowd the rest of the run out of the transcript.
      MAX_LINES = 8

      def initialize(layout:, author:, locale:, client: nil)
        @layout = layout
        @author = author
        @locale = locale
        @client = client || ContentBuilder::CustomBlocks::CheckServiceClient.new
      end

      # @param target [Hash] what to mount, in the check service's shape.
      # @return [Hash] { text:, error:, screenshot: } — a tool outcome.
      def check(target, screenshot: false)
        return unavailable('There is no report to check yet.') if @layout.nil?

        result = @client.render(
          target: target,
          locale: @locale,
          layout_id: @layout.id,
          app_origin: app_origin,
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

      # Failures first and in full; what passed is one line, because a model that is
      # told at length what already works will spend a round admiring it.
      def summarize(result, screenshot:)
        checks = result['checks'] || []
        failed = checks.reject { |entry| entry['ok'] }

        lines = []
        lines << (failed.empty? ? 'Everything checked out.' : "#{failed.size} check(s) failed:")
        failed.each { |entry| lines << "- #{entry['id']}: #{entry['message']}" }
        lines.concat(detail_lines(result))

        {
          error: failed.any?,
          text: lines.join("\n"),
          # The picture goes to the model when a check failed and it cannot say what
          # is wrong, or when the model asked to see it.
          screenshot: failed.any? || screenshot ? result['screenshot'] : nil
        }
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
