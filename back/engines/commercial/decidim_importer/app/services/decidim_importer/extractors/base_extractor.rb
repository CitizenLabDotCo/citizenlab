# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Shared helpers for the per-model XLSX extractors. Each subclass reads parsed rows
    # (arrays of `{ column_header => value }` hashes, as produced by `XlsxService#xlsx_to_hash_array`)
    # and registers {Record}s into the shared {RefMap}.
    class BaseExtractor
      def initialize(rows, ref_map, locale_mapper:, primary_locale: 'fr-FR')
        @rows = rows || []
        @ref_map = ref_map
        @locale_mapper = locale_mapper
        @primary_locale = primary_locale
      end

      # @abstract registers records into the ref map. Returns the records it created.
      def run
        raise NotImplementedError
      end

      private

      attr_reader :rows, :ref_map, :locale_mapper, :primary_locale

      # Builds a multiloc from a cell. Decidim stores multilocs either as a JSON object
      # (`{"fr":"…","en":"…"}`) in a single cell or as plain text in the platform's primary locale.
      # Locale codes are mapped onto Go Vocal codes.
      def multiloc(value)
        return {} if value.nil? || value.to_s.strip.empty?

        parsed = try_parse_json(value)
        if parsed.is_a?(Hash)
          parsed.each_with_object({}) do |(locale, text), acc|
            next if text.nil? || text.to_s.strip.empty?

            acc[locale_mapper.map(locale)] = text.to_s
          end
        else
          { primary_locale => value.to_s }
        end
      end

      def try_parse_json(value)
        return value if value.is_a?(Hash)

        str = value.to_s.strip
        return nil unless str.start_with?('{')

        JSON.parse(str)
      rescue JSON::ParserError
        nil
      end

      def truthy?(value)
        Parsing.truthy?(value)
      end

      # The download filename for an attachment: the URL's percent-decoded basename (extension kept),
      # or the given `fallback` (usually the attachment title) when the URL has no usable basename.
      def filename_from_url(url, fallback)
        basename = File.basename(URI.parse(url.to_s).path.to_s)
        decoded = CGI.unescape(basename)
        usable = present_value(decoded) unless decoded.in?(%w[/ .])
        usable || present_value(fallback)
      rescue URI::InvalidURIError
        present_value(fallback)
      end

      # An imported file's name: the first locale of the Decidim title, with the URL's file extension
      # appended unless the title already carries it (e.g. "Compte-rendu" + ".pdf" → "Compte-rendu.pdf";
      # "schema.pdf" stays "schema.pdf"). Falls back to the URL's own basename when there is no title.
      # Nil when neither yields a name.
      def attachment_name(url, title_multiloc)
        title = present_value(title_multiloc.values.first)
        return filename_from_url(url, nil) if title.nil?

        ext = url_extension(url)
        ext.empty? || title.downcase.end_with?(ext.downcase) ? title : "#{title}#{ext}"
      end

      # The file extension (with the leading dot) of the URL's path, or '' when it has none.
      def url_extension(url)
        File.extname(URI.parse(url.to_s).path.to_s)
      rescue URI::InvalidURIError
        ''
      end

      def present_value(value)
        str = value.to_s.strip
        str.empty? ? nil : str
      end

      # Decidim timestamps come through as strings or Time-like values; normalise to a string the
      # deserializer assigns verbatim. Returns nil for blanks.
      def timestamp(value)
        return nil if value.nil?
        return value.to_s if value.respond_to?(:strftime)

        present_value(value)
      end
    end
  end
end
