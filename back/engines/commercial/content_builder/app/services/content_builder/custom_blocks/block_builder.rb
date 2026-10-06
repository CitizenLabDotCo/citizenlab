# frozen_string_literal: true

module ContentBuilder
  module CustomBlocks
    # Everything that has to be true before a block version may be written: it
    # compiles, it typechecks against the SDK, it obeys the block rules, and every
    # query it runs survives the reporting SQL sandbox.
    #
    # The sandbox answers the first three. The fourth stays here, because the
    # sandbox already exists and has one implementation ({McpServer::SqlSandboxer}, via
    # {McpServer::ReportingQueryRunner}) shared with the MCP reporting tool. Running it
    # immediately after the build call keeps the property that matters: the model gets
    # the type error and the rejected query in the same answer, and fixes both in one
    # edit. No database is touched — validation is a parse.
    class BlockBuilder
      Result = Data.define(:ok, :bundle, :manifest, :diagnostics, :toolchain) do
        def ok? = ok

        # One block of text, which is what a tool result is.
        def diagnostics_text
          diagnostics.map { |d| "- #{d}" }.join("\n")
        end
      end

      Diagnostic = Data.define(:kind, :line, :column, :message, :rule) do
        def to_s
          suffix = rule ? " (#{rule})" : ''
          "[#{kind}] #{location}#{message}#{suffix}"
        end

        private

        def location
          return '' if line.nil?

          column ? "line #{line}:#{column}: " : "line #{line}: "
        end
      end

      def initialize(client: SandboxClient.new)
        @client = client
      end

      # @param source [String] the complete TSX of the block.
      # @param manifest [Hash] the manifest, without `queries` — the build fills those in.
      # @param messages [Hash] locale => { key => text }.
      # @param locales [Array<String>] the locales that need a catalogue.
      # @raise [SandboxClient::Unavailable]
      def call(source:, manifest:, messages: {}, locales: nil)
        response = @client.build(
          source: source,
          manifest: manifest,
          messages: messages,
          locales: locales || tenant_locales
        )

        diagnostics = parse_diagnostics(response['diagnostics'])
        # Only `queries` is taken back from the service: it is the one thing the build
        # knows and we do not. The rest of the manifest is ours, so a sidecar that
        # echoes it back incompletely cannot quietly drop a field.
        queries, sql_diagnostics = validate_queries(response.dig('manifest', 'queries'))
        diagnostics += sql_diagnostics

        ok = response['ok'] && sql_diagnostics.empty?

        Result.new(
          ok: ok,
          bundle: ok ? response['bundle'] : nil,
          manifest: manifest.merge('queries' => queries),
          diagnostics: diagnostics,
          toolchain: response['toolchain'] || {}
        )
      end

      private

      def tenant_locales
        AppConfiguration.instance.settings('core', 'locales') || ['en']
      end

      def parse_diagnostics(raw)
        Array(raw).map do |entry|
          Diagnostic.new(
            kind: entry['kind'],
            line: entry['line'],
            column: entry['column'],
            message: entry['message'],
            rule: entry['rule']
          )
        end
      end

      # Stores the sandbox's normalized SQL rather than what the model wrote, so that
      # "which blocks read this view?" compares like with like, and so the snapshot key
      # does not change with whitespace.
      def validate_queries(queries)
        normalized = []
        diagnostics = []

        Array(queries).each_with_index do |sql, index|
          normalized << McpServer::ReportingQueryRunner.validate!(sql)
        rescue McpServer::ReportingQueryRunner::Rejected => e
          diagnostics << Diagnostic.new(
            kind: 'sql', line: nil, column: nil, rule: nil,
            message: "Query #{index + 1} was rejected. #{e.message}"
          )
        end

        [normalized, diagnostics]
      end
    end
  end
end
