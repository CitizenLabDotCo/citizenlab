# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Turns one authored chart into a stored custom block: validates the query and
    # the source, then writes a block and its first version.
    #
    # The version is stored `pending`. There is no JavaScript toolchain on the
    # backend, so the source is not compiled here — the browser compiles it when the
    # report is first opened and fills in the bundle.
    class ChartBlockAuthor
      class Rejected < StandardError; end

      Result = Data.define(:block_id, :version_number)

      def initialize(report, author)
        @report = report
        @author = author
      end

      # @param title [String] the block name admins see in the builder.
      # @param sql [String] the one reporting query the chart draws.
      # @param source [String] the complete TSX of the block.
      # @raise [Rejected] with a message the composer can correct itself from.
      def author(title:, sql:, source:)
        normalized_sql = validate_query!(sql)
        validate_source!(source, sql)

        # Draft first: a block cannot be published before it has a version to render.
        block = ContentBuilder::CustomBlock.create!(
          title_multiloc: { locale => title.to_s.strip.presence || 'Chart' },
          status: 'draft',
          created_by: @author
        )
        version = block.versions.create!(
          source: source,
          compile_state: 'pending',
          manifest: manifest(normalized_sql)
        )
        block.update!(current_version: version, status: 'published')

        Result.new(block_id: block.id, version_number: version.number)
      rescue ActiveRecord::RecordInvalid => e
        raise Rejected, "The block could not be saved: #{e.record.errors.full_messages.join('; ')}"
      end

      private

      def locale
        AppConfiguration.instance.settings('core', 'locales')&.first || 'en'
      end

      def validate_query!(sql)
        McpServer::ReportingQueryRunner.validate!(sql)
      rescue McpServer::ReportingQueryRunner::Rejected => e
        raise Rejected, e.message
      end

      # The query is stored in the manifest as well as written in the source, so a
      # later audit ("which blocks read this view?") is a database question rather
      # than a parse of every block. Requiring the source to contain it verbatim is
      # what keeps the two honest without parsing TSX here.
      def validate_source!(source, sql)
        raise Rejected, 'source is required.' if source.blank?

        unless source.include?(sql)
          raise Rejected,
            'The source must contain the sql you passed, character for character, as the ' \
            'string handed to useReportingData. Put it in one `const SQL = `...`;` at the ' \
            'top of the file and pass SQL to the hook.'
        end

        diagnostics = ContentBuilder::CustomBlocks::SourceLinter.lint(source)
        return if diagnostics.empty?

        raise Rejected, "The source is not allowed:\n#{diagnostics.map { |d| "- #{d}" }.join("\n")}"
      end

      def manifest(normalized_sql)
        {
          'manifest_version' => 1,
          'sdk_version' => 1,
          'targets' => ['report'],
          'data_uses' => ['useReportingData'],
          'queries' => [normalized_sql],
          'config_schema' => []
        }
      end
    end
  end
end
