# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Turns one authored chart into a stored custom block.
    #
    # Everything that decides whether the chart is acceptable happens in
    # {ContentBuilder::CustomBlocks::BlockBuilder}: it compiles the source, typechecks
    # it against the SDK, applies the block rules, extracts the queries it runs and puts
    # them through the reporting SQL sandbox. Only a block that came back clean is
    # written, and it is written complete — source, compiled bundle, manifest and
    # message catalogues in one immutable version.
    #
    # Nothing is stored half-built, so nothing has to be repaired later at the moment a
    # reader opens the report.
    class ChartBlockAuthor
      class Rejected < StandardError; end

      Result = Data.define(:block_id, :version_number)

      # More settings than this and the sidebar stops being a quick edit.
      MAX_CONFIG_FIELDS = 6

      # The JSON Schema types the settings sidebar knows how to render a control for.
      CONFIG_FIELD_TYPES = %w[string number integer boolean].freeze

      # Values the `x-picker` extension may take: a control that resolves platform
      # records instead of asking the admin to paste an id.
      #
      # Only project, for now. A phase picker needs a project to scope itself to, and
      # a block has none. Either way a picker cannot change what the chart reads: the
      # SQL is a static string extracted at build time, so config only ever affects
      # presentation.
      CONFIG_PICKERS = %w[project].freeze

      # `x-multiloc` marks a string field whose value is a multiloc object, so the
      # sidebar offers one input per locale. Plain JSON Schema has no notion of a
      # translated string, and a chart title that only exists in one language is not
      # something this platform can ship.
      MULTILOC_EXTENSION = 'x-multiloc'

      # @param locale [String] the locale the report is written in. A composed report is
      #   single-locale by design, and a block's catalogues follow it.
      def initialize(author, locale: nil)
        @author = author
        @locale = locale
      end

      # @param title [String] the block name admins see in the builder.
      # @param source [String] the complete TSX of the block.
      # @param config_schema [Hash] a JSON Schema object describing the sidebar fields.
      # @param messages [Hash] locale => { key => text }, for every string the block shows.
      # @raise [Rejected] with a message the composer can correct itself from.
      def author(title:, source:, config_schema: nil, messages: nil)
        raise Rejected, 'source is required.' if source.blank?

        schema = validate_config_schema!(config_schema)
        catalogues = normalize_messages(messages)
        built = build!(source, schema, catalogues)

        block = ContentBuilder::CustomBlock.create!(
          title_multiloc: { locale => title.to_s.strip.presence || 'Chart' },
          status: 'draft',
          created_by: @author
        )
        version = block.versions.create!(
          source: source,
          bundle: built.bundle,
          manifest: built.manifest,
          messages: catalogues,
          toolchain: built.toolchain,
          sdk_version: built.manifest['sdk_version'].presence || 'v1'
        )
        block.update!(status: 'published')

        Result.new(block_id: block.id, version_number: version.number)
      rescue ActiveRecord::RecordInvalid => e
        raise Rejected, "The block could not be saved: #{e.record.errors.full_messages.join('; ')}"
      end

      # Changes one passage of an already-authored chart and writes the result as a new
      # version.
      #
      # Search and replace rather than a fresh source, because a model that has to
      # re-emit a whole file to fix one word spends thousands of output tokens on text
      # that did not change, and every one of those replies is new, uncacheable
      # transcript. A failed match is loud on purpose: a silent no-op, or an edit
      # applied in the wrong one of three similar places, is worse than an error.
      #
      # The previous version stays exactly as it was. If a report already places it, it
      # keeps rendering what it always rendered.
      #
      # @param block_id [String] a block authored in this run.
      # @param find [String] the passage to replace. Must appear exactly once.
      # @param replace [String] what to put there.
      # @raise [Rejected] with a message the composer can correct itself from.
      def edit(block_id:, find:, replace:)
        raise Rejected, 'find is required.' if find.blank?

        block = ContentBuilder::CustomBlock.find_by(id: block_id)
        raise Rejected, "No block #{block_id}." if block.nil?

        previous = block.latest_version
        raise Rejected, "Block #{block_id} has no version to edit." if previous.nil?

        source = replace_once!(previous.source, find, replace.to_s)
        built = build!(source, previous.manifest['config_schema'], previous.messages)

        version = block.versions.create!(
          source: source,
          bundle: built.bundle,
          manifest: built.manifest,
          messages: previous.messages,
          toolchain: built.toolchain,
          sdk_version: built.manifest['sdk_version'].presence || 'v1'
        )

        Result.new(block_id: block.id, version_number: version.number)
      rescue ActiveRecord::RecordInvalid => e
        raise Rejected, "The block could not be saved: #{e.record.errors.full_messages.join('; ')}"
      end

      private

      def replace_once!(source, find, replace)
        # String#scan with a String matches literally; handing it an escaped pattern
        # would look for the backslashes too.
        occurrences = source.scan(find).size

        if occurrences.zero?
          raise Rejected,
            'That passage is not in the source, character for character. Nothing was ' \
            'changed. Read the source again and copy the exact text, whitespace included.'
        end

        if occurrences > 1
          raise Rejected,
            "That passage appears #{occurrences} times, so there is no telling which one " \
            'you meant. Nothing was changed. Include enough surrounding text to name one.'
        end

        # Block form: a replacement string would read \\1 and \\& as backreferences,
        # and generated source is full of backslashes.
        source.sub(find) { replace }
      end

      def locale
        @locale.presence || AppConfiguration.instance.settings('core', 'locales')&.first || 'en'
      end

      def build!(source, schema, catalogues)
        result = ContentBuilder::CustomBlocks::BlockBuilder.new.call(
          source: source,
          manifest: manifest(schema),
          messages: catalogues,
          locales: [locale]
        )
        return result if result.ok?

        raise Rejected, "The block does not build yet:\n#{result.diagnostics_text}"
      rescue ContentBuilder::CustomBlocks::CheckServiceClient::Unavailable => e
        # Not the model's fault and not something it can correct, so say so plainly
        # rather than sending it back to rewrite working code.
        raise Rejected, "Charts cannot be checked right now, so none can be stored. #{e.message}"
      end

      # Every visible string goes through msg(), so a block with no catalogue would
      # render nothing but raw keys.
      def normalize_messages(messages)
        return {} if messages.blank?

        unless messages.is_a?(Hash) && messages.values.all?(Hash)
          raise Rejected,
            'messages must be an object of locale to key-value pairs, ' \
            'e.g. {"en":{"title":"Contributions per month"}}.'
        end

        messages
      end

      # Rejected rather than silently dropped: a field the builder cannot render is a
      # setting the admin was promised and does not get.
      def validate_config_schema!(config_schema)
        return nil if config_schema.blank?

        unless config_schema.is_a?(Hash)
          raise Rejected, 'config_schema must be a JSON Schema object: {"type":"object","properties":{...}}.'
        end

        properties = config_schema['properties']
        return { 'type' => 'object', 'properties' => {} } if properties.blank?

        unless properties.is_a?(Hash)
          raise Rejected, 'config_schema properties must be an object keyed by field name.'
        end

        if properties.size > MAX_CONFIG_FIELDS
          raise Rejected,
            "config_schema has #{properties.size} fields; #{MAX_CONFIG_FIELDS} is the most a chart may expose."
        end

        properties.each { |key, field| validate_config_field!(key, field) }
        validate_required!(config_schema, properties)

        config_schema.slice('type', 'properties', 'required').merge('type' => 'object')
      end

      def validate_config_field!(key, field)
        unless key.to_s.match?(/\A[a-zA-Z][a-zA-Z0-9_]*\z/)
          raise Rejected, "config_schema key #{key.inspect} must be a JavaScript identifier, e.g. \"showValues\"."
        end

        raise Rejected, "config_schema field #{key.inspect} must be an object." unless field.is_a?(Hash)

        type = field['type'].to_s
        unless CONFIG_FIELD_TYPES.include?(type)
          raise Rejected,
            "config_schema field #{key.inspect} has type #{type.inspect}; use one of #{CONFIG_FIELD_TYPES.join(', ')}."
        end

        if field['title'].blank?
          raise Rejected, "config_schema field #{key.inspect} needs a title, the label the admin reads."
        end

        validate_enum!(key, field)
        validate_picker!(key, field)
        validate_multiloc!(key, field, type)
      end

      def validate_multiloc!(key, field, type)
        return if field[MULTILOC_EXTENSION].blank?

        return if type == 'string'

        raise Rejected,
          "config_schema field #{key.inspect} is marked #{MULTILOC_EXTENSION} but has type " \
          "#{type.inspect}; only a string can be translated."
      end

      def validate_enum!(key, field)
        enum = field['enum']
        return if enum.nil?

        unless enum.is_a?(Array) && enum.any? && enum.all?(String)
          raise Rejected, "config_schema field #{key.inspect} has an enum, so it needs a non-empty array of strings."
        end
      end

      def validate_picker!(key, field)
        picker = field['x-picker']
        return if picker.nil? || CONFIG_PICKERS.include?(picker.to_s)

        raise Rejected,
          "config_schema field #{key.inspect} has x-picker #{picker.inspect}; " \
          "use one of #{CONFIG_PICKERS.join(', ')}."
      end

      def validate_required!(config_schema, properties)
        required = config_schema['required']
        return if required.nil?

        unless required.is_a?(Array)
          raise Rejected, 'config_schema required must be an array of field names.'
        end

        unknown = required.map(&:to_s) - properties.keys.map(&:to_s)
        return if unknown.empty?

        raise Rejected, "config_schema requires fields it does not define: #{unknown.join(', ')}."
      end

      # `queries` is deliberately absent: the build extracts it from the source, so the
      # manifest cannot disagree with the code about what the block reads.
      def manifest(schema)
        {
          'manifest_version' => 1,
          'sdk_version' => 'v1',
          'targets' => ['report'],
          'data_uses' => ['useReportingData'],
          'config_schema' => schema || { 'type' => 'object', 'properties' => {} }
        }
      end
    end
  end
end
