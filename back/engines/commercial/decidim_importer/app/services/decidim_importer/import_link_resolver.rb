# frozen_string_literal: true

module DecidimImporter
  # Resolves a Decidim URL to the Go Vocal href for the imported content it points at, backing
  # {LinkCorrector}. Built from the {RefMap} once every record is registered, so it can look content
  # up by the identifiers the import assigned.
  #
  #   * **content** (rule 2) — a `…/processes/<slug>/…` link resolves to the project imported from that
  #     process. Projects keep their Decidim slug on import ({Extractors::ProjectsExtractor}), so the
  #     slug in the link is exactly the imported project's slug and the target is `/projects/<slug>`.
  #   * **files** (rule 4) — an Active Storage blob link resolves, by its (decoded) filename, to the
  #     imported `Files::File` of the same name, and is repointed at that file's stored content path.
  #     The path is derived from the file's assigned id and CarrierWave's filename sanitisation, so it
  #     is known before upload; it is the local/unsigned storage URL (a best-effort target — a signed
  #     or CDN-hosted deployment serves the same file under a different, non-derivable URL).
  class ImportLinkResolver
    def initialize(ref_map)
      @project_slugs = project_slugs(ref_map)
      @files_by_name = files_by_name(ref_map)
    end

    # A same-domain/relative link → a Go Vocal internal path, or nil when nothing matches.
    def content_href(url)
      path = path_of(url)
      slug = path && path[%r{\A/processes/([^/]+)}, 1]
      return "/projects/#{slug}" if slug && @project_slugs.include?(slug)

      nil
    end

    # An Active Storage link → an imported file's content path, or nil when nothing matches.
    def file_href(url)
      name = filename_of(url)
      file = name && @files_by_name[name]
      return nil unless file

      "/uploads/files/file/content/#{file.attributes['id']}/#{sanitize_filename(file.attributes['name'])}"
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

    # Replicates CarrierWave's default filename sanitisation (`SanitizedFile#sanitize`), which is what
    # produces the on-disk filename in the file's stored URL: every character that isn't a word
    # character, dot, dash or plus becomes an underscore.
    def sanitize_filename(name)
      File.basename(name.to_s.tr('\\', '/')).gsub(/[^[:word:].\-+]/, '_')
    end
  end
end
