# frozen_string_literal: true

require 'csv'

module DecidimImporter
  module Links
    # Old-URL → new-target mapping for links in imported rich text, plus links that *should* be
    # repointed but couldn't be ("broken"). A target is a final URL, or a *file id* — an imported file's
    # URL isn't known until it's uploaded, so file links are stored by id and resolved to `content.url`
    # on apply.
    #
    # Built while the template is built ({.build}, driven by a {Corrector}), serialised to a CSV beside
    # the template, and applied after the import by the `decidim_importer:correct_links` rake task
    # ({#apply}). Build (needs Decidim source data) and apply (needs the imported tenant) are split,
    # which is why the mapping is persisted rather than applied inline.
    class Map
      # Captures an `<a … href="…">` (or single-quoted): $1 = up to and including `href=`, $2 = quote,
      # $3 = URL (non-greedy, stops at the closing quote), $4 = the rest of the open tag through `>`.
      HREF = /(<a\b[^>]*?\bhref\s*=\s*)(["'])(.*?)\2([^>]*>)/im

      # A `rel` token marking an anchor whose href must be left untouched — e.g. the import-source
      # back-link, which should keep pointing at the original Decidim URL. Honoured by {.build}/{#apply}.
      KEEP_HREF_REL = 'cl-original-href'

      CSV_HEADERS = %w[old_url new_url file_id].freeze

      # @param replacements [Hash{String=>String}] old URL → new URL
      # @param file_refs [Hash{String=>String}] old URL → imported file id (URL resolved on apply)
      # @param broken [Array<String>] old URLs that should be repointed but resolved to nothing
      def initialize(replacements = {}, file_refs = {}, broken = [])
        @replacements = replacements
        @file_refs = file_refs
        @broken = broken.uniq
      end

      attr_reader :replacements, :file_refs, :broken

      # Scans the HTML strings for links, classifying each through the corrector into replacements, file
      # references, or broken.
      def self.build(html_strings, corrector)
        replacements = {}
        file_refs = {}
        broken = []
        html_strings.each do |html|
          next unless html.is_a?(String)

          html.scan(HREF) do |prefix, _quote, raw, suffix|
            next if "#{prefix}#{suffix}".include?(KEEP_HREF_REL) # tagged link — never map its href

            url = CGI.unescapeHTML(raw).strip
            next if url.empty? || replacements.key?(url) || file_refs.key?(url) || broken.include?(url)

            decision = corrector.resolve(url)
            next if decision.nil?

            if decision[:new]
              replacements[url] = decision[:new]
            elsif decision[:file_id]
              file_refs[url] = decision[:file_id]
            else
              broken << url
            end
          end
        end
        new(replacements, file_refs, broken)
      end

      # Rewrites every mapped link in an HTML string. File links are resolved via `file_resolver` (a
      # `file_id → url_or_nil` callable); an unresolvable file or a broken link is left untouched but its
      # URL collected. Returns `[new_html, broken_urls_found]`.
      def apply(html, file_resolver: DEFAULT_FILE_RESOLVER)
        return [html, []] unless html.is_a?(String) && html.include?('href')

        found_broken = []
        new_html = html.gsub(HREF) do
          prefix = Regexp.last_match(1)
          quote = Regexp.last_match(2)
          raw = Regexp.last_match(3)
          suffix = Regexp.last_match(4)
          # A tagged link keeps its original href (the suffix carries the marker `rel` token).
          next "#{prefix}#{quote}#{raw}#{quote}#{suffix}" if "#{prefix}#{suffix}".include?(KEEP_HREF_REL)

          url = CGI.unescapeHTML(raw).strip
          new_url = resolve_target(url, file_resolver, found_broken)
          replacement = new_url ? CGI.escapeHTML(new_url) : raw
          "#{prefix}#{quote}#{replacement}#{quote}#{suffix}"
        end
        [new_html, found_broken]
      end

      def empty?
        @replacements.empty? && @file_refs.empty? && @broken.empty?
      end

      # The number of links with a resolvable target (URLs + file references).
      def resolved_count
        @replacements.size + @file_refs.size
      end

      # Writes the mapping as CSV (`old_url,new_url,file_id`); a broken link is a row with both blank.
      def write_csv(path)
        CSV.open(path, 'w') do |csv|
          csv << CSV_HEADERS
          @replacements.each { |old_url, new_url| csv << [old_url, new_url, nil] }
          @file_refs.each { |old_url, file_id| csv << [old_url, nil, file_id] }
          @broken.each { |old_url| csv << [old_url, nil, nil] }
        end
      end

      def self.read_csv(path)
        replacements = {}
        file_refs = {}
        broken = []
        CSV.foreach(path, headers: true) do |row|
          old_url = row['old_url'].to_s.strip
          next if old_url.empty?

          new_url = row['new_url'].to_s.strip
          file_id = row['file_id'].to_s.strip
          if new_url.present?
            replacements[old_url] = new_url
          elsif file_id.present?
            file_refs[old_url] = file_id
          else
            broken << old_url
          end
        end
        new(replacements, file_refs, broken)
      end

      DEFAULT_FILE_RESOLVER = ->(_file_id) {}
      private_constant :DEFAULT_FILE_RESOLVER

      private

      # The URL a link should become, or nil to leave it as-is. A broken link (or a file id that no
      # longer resolves) is pushed onto `found_broken` for reporting.
      def resolve_target(url, file_resolver, found_broken)
        if (new_url = @replacements[url])
          new_url
        elsif @file_refs.key?(url)
          file_url = file_resolver.call(@file_refs[url])
          found_broken << url unless file_url
          file_url
        else
          found_broken << url if @broken.include?(url)
          nil
        end
      end
    end
  end
end
