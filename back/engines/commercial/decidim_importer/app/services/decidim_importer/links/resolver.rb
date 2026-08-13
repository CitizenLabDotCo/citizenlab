# frozen_string_literal: true

module DecidimImporter
  module Links
    # Resolves a Decidim URL to the Go Vocal href for the imported content it points at, backing
    # {Corrector}. Built from the {RefMap} after every record is registered, so it can look content up
    # by the identifiers the import assigned.
    #
    #   * **content** (rule 2) — a `…/processes/<slug>/…` link resolves to `/projects/<slug>`. Projects
    #     keep their Decidim slug on import ({Extractors::ProjectsExtractor}), so the slugs match.
    #   * **files** (rule 4) — an Active Storage blob link resolves by (decoded) filename to the imported
    #     `Files::File` of the same name, returning its *id*. The URL isn't known until the file is
    #     uploaded, so the post-import `correct_links` task turns the id into the file's `content.url`.
    class Resolver
      def initialize(ref_map)
        @project_slugs = project_slugs(ref_map)
        @files_by_name = files_by_name(ref_map)
      end

      # A same-domain/relative link → a Go Vocal internal path, or nil when nothing matches. The slug is
      # sanitized the same way {Extractors::ProjectsExtractor} sanitizes the project's, so a link keeps
      # resolving even when the source slug was normalised on import.
      def content_href(url)
        path = path_of(url)
        raw = path && path[%r{\A/processes/([^/]+)}, 1]
        slug = raw && Slug.sanitize(raw)
        return "/projects/#{slug}" if slug && @project_slugs.include?(slug)

        nil
      end

      # An Active Storage link → the id of the imported file with the same (decoded) filename, or nil.
      def file_id(url)
        name = filename_of(url)
        file = name && @files_by_name[name]
        file&.attributes&.fetch('id', nil)
      end

      private

      def project_slugs(ref_map)
        ref_map.records.each_with_object(Set.new) do |record, set|
          next unless record.model_name == 'project'

          slug = record.attributes['slug']
          set << slug if slug.present?
        end
      end

      # First file wins on a duplicate name — linking either would be a guess, so we stay deterministic.
      def files_by_name(ref_map)
        ref_map.records.each_with_object({}) do |record, map|
          next unless record.model_name == 'files/file'

          name = record.attributes['name']
          map[name] ||= record if name.present?
        end
      end

      # The path portion of a URL or relative link: no scheme/host, no query/fragment, no trailing slash.
      def path_of(url)
        str = url.to_s.strip
        return nil if str.empty?

        path = str.include?('//') ? (URI.parse(str).path.presence || '/') : str.split(/[?#]/, 2).first
        path == '/' ? path : path.chomp('/')
      rescue URI::InvalidURIError
        nil
      end

      # The decoded basename of a URL's path (the stored filename to match against `Files::File#name`).
      def filename_of(url)
        path = path_of(url)
        return nil unless path

        base = File.basename(path)
        base.empty? ? nil : CGI.unescape(base)
      end
    end
  end
end
