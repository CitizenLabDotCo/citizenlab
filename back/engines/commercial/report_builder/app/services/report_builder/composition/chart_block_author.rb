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

      # The settings an admin may change on a placed chart. Anything outside this
      # set has no input to render it, so it would be dead weight in the manifest.
      CONFIG_FIELD_TYPES = %w[text number boolean multiloc_text select].freeze

      # More than this and the sidebar stops being a quick edit.
      MAX_CONFIG_FIELDS = 6

      # @param title [String] the block name admins see in the builder.
      # @param sql [String] the one reporting query the chart draws.
      # @param source [String] the complete TSX of the block.
      # @param config_schema [Array<Hash>] the fields exposed in the builder sidebar.
      # @raise [Rejected] with a message the composer can correct itself from.
      def author(title:, sql:, source:, config_schema: nil)
        normalized_sql = validate_query!(sql)
        validate_source!(source, sql)
        schema = validate_config_schema!(config_schema)

        # Draft first: a block cannot be published before it has a version to render.
        block = ContentBuilder::CustomBlock.create!(
          title_multiloc: { locale => title.to_s.strip.presence || 'Chart' },
          status: 'draft',
          created_by: @author
        )
        version = block.versions.create!(
          source: source,
          compile_state: 'pending',
          manifest: manifest(normalized_sql, schema)
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

      # Rejected rather than silently dropped: a field the builder cannot render is
      # a setting the admin was promised and does not get.
      def validate_config_schema!(config_schema)
        return [] if config_schema.blank?

        unless config_schema.is_a?(Array)
          raise Rejected, 'config_schema must be an array of fields.'
        end

        if config_schema.size > MAX_CONFIG_FIELDS
          raise Rejected, "config_schema has #{config_schema.size} fields; #{MAX_CONFIG_FIELDS} is the most a chart may expose."
        end

        keys = config_schema.pluck('key')
        if keys.uniq.size != keys.size
          raise Rejected, 'Every config_schema key must be unique within the block.'
        end

        config_schema.map { |field| validate_config_field!(field) }
      end

      def validate_config_field!(field)
        raise Rejected, 'Each config_schema entry must be an object.' unless field.is_a?(Hash)

        key = field['key'].to_s
        unless key.match?(/\A[a-zA-Z][a-zA-Z0-9_]*\z/)
          raise Rejected, "config_schema key #{field['key'].inspect} must be a JavaScript identifier, e.g. \"showValues\"."
        end

        type = field['type'].to_s
        unless CONFIG_FIELD_TYPES.include?(type)
          raise Rejected, "config_schema field #{key.inspect} has type #{type.inspect}; use one of #{CONFIG_FIELD_TYPES.join(', ')}."
        end

        unless field['label'].is_a?(Hash) && field['label'].values.any?(&:present?)
          raise Rejected, "config_schema field #{key.inspect} needs a label per locale, e.g. {\"en\":\"Chart title\"}."
        end

        validate_select_options!(key, field) if type == 'select'

        field.slice('key', 'label', 'type', 'default', 'options').compact
      end

      def validate_select_options!(key, field)
        options = field['options']
        unless options.is_a?(Array) && options.any?
          raise Rejected, "config_schema field #{key.inspect} is a select, so it needs options."
        end

        return if options.all? { |o| o.is_a?(Hash) && o['value'].present? && o['label'].is_a?(Hash) }

        raise Rejected,
          "Every option of #{key.inspect} needs a value and a label per locale: " \
          '[{"value":"count","label":{"en":"Count"}}].'
      end

      def manifest(normalized_sql, config_schema)
        {
          'manifest_version' => 1,
          'sdk_version' => 1,
          'targets' => ['report'],
          'data_uses' => ['useReportingData'],
          'queries' => [normalized_sql],
          'config_schema' => config_schema
        }
      end
    end
  end
end
