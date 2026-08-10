# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Shared helpers for the per-model CSV extractors. Each subclass reads parsed rows
    # (`{ column_header => value }` hashes) and registers {Record}s into the shared {RefMap}.
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

      # Rows the extractor couldn't import, as `{ uid:, reason: }` hashes for the dump's skip log.
      def skipped
        @skipped ||= []
      end

      private

      attr_reader :rows, :ref_map, :locale_mapper, :primary_locale

      # Records a row as skipped (with its reason) and returns nil, so callers can `return skip(...)`.
      def skip(uid, reason)
        skipped << { uid: uid, reason: reason }
        nil
      end

      # The ownership join placing an imported file in a project's file repository, so it's
      # linkable/attachable from the project. Shared by the file and attachment extractors.
      def register_files_project(uid, file, project)
        files_project = Record.new('files/files_project', {})
        files_project.reference('file', file)
        files_project.reference('project', project)
        ref_map.register("#{uid}-files-project", files_project)
      end

      # Registers a custom, project-scoped `StaticPage` with an explicit id so a Content Builder
      # `PageLink` can reference it (refs can't reach into the JSONB blob). Shared by pages and blogs.
      def register_static_page(uid, project, title:, body:, created_at: nil, updated_at: nil)
        attributes = {
          'id' => SecureRandom.uuid,
          'title_multiloc' => title,
          'code' => 'custom',
          'top_info_section_enabled' => true,
          'top_info_section_multiloc' => body
        }
        attributes['created_at'] = created_at if created_at
        attributes['updated_at'] = updated_at if updated_at
        page = Record.new('static_page', attributes)
        page.reference('project', project)
        ref_map.register(uid, page)
      end

      # A multiloc translation of a `decidim_importer.<key>` back-end string, with English fallback
      # for locales with no translation yet.
      def i18n_multiloc(key, locales:)
        MultilocService.new.i18n_to_multiloc("decidim_importer.#{key}", locales: locales, raise_on_missing: false)
      end

      # Builds a multiloc from a cell. Decidim stores multilocs as a JSON object (`{"fr":"…"}`) or as
      # plain text in the primary locale. Locale codes are mapped onto Go Vocal codes.
      def multiloc(value)
        return {} if value.nil? || value.to_s.strip.empty?

        parsed = Parsing.parse_json(value)
        if parsed.is_a?(Hash)
          parsed.each_with_object({}) do |(locale, text), acc|
            next if text.nil? || text.to_s.strip.empty?

            acc[locale_mapper.map(locale)] = text.to_s
          end
        else
          { primary_locale => value.to_s }
        end
      end

      # The multiloc keeping only locales whose HTML carries real content — mirroring the
      # `multiloc: { presence: true }` validator (`SanitizationService#html_with_content?`), so a
      # visually-empty value like `<p><br></p>` doesn't pass `multiloc`'s strip check yet fail on save.
      def html_present_multiloc(mloc)
        sanitizer = SanitizationService.new
        mloc.select { |_locale, html| sanitizer.html_with_content?(html) }
      end

      def truthy?(value)
        Parsing.truthy?(value)
      end

      # The download filename: the URL's percent-decoded basename, or `fallback` when the URL has none.
      def filename_from_url(url, fallback)
        basename = File.basename(URI.parse(url.to_s).path.to_s)
        decoded = CGI.unescape(basename)
        usable = present_value(decoded) unless decoded.in?(%w[/ .])
        usable || present_value(fallback)
      rescue URI::InvalidURIError
        present_value(fallback)
      end

      # An imported file's name: the first locale of the Decidim title with the URL's extension appended
      # unless already present. Falls back to the URL's basename when there's no title; nil if neither.
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
        Parsing.present_value(value)
      end

      # Normalise a Decidim timestamp (string or Time-like) to a string the deserializer assigns
      # verbatim. Nil for blanks.
      def timestamp(value)
        return nil if value.nil?
        return value.to_s if value.respond_to?(:strftime)

        present_value(value)
      end
    end
  end
end
