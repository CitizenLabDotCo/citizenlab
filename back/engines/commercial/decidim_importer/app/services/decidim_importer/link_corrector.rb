# frozen_string_literal: true

module DecidimImporter
  # Best-effort correction of the links embedded in imported rich text (project descriptions and
  # static pages). Decidim bodies link back to the *source* platform in ways that would dead-end on
  # Go Vocal, so each `<a href>` is rewritten by these rules (applied in this order):
  #
  #   1. The source platform's domain is supplied by the caller (`original_domain`).
  #   2. A relative link, or an absolute one on the original domain, is matched against the imported
  #      content by its Decidim URL (the `url` column) and repointed at the Go Vocal equivalent — e.g.
  #      `https://<domain>/processes/<slug>/…` → `/projects/<slug>`. A same-domain link that matches
  #      nothing is left pointing at the original site (made absolute if it was relative).
  #   3. A Decidim external-link redirect (`…/link?external_url=<encoded>`) is unwrapped to just the
  #      target URL it wraps.
  #   4. An Active Storage blob link (`…/rails/active_storage/…`) is matched to an imported attachment
  #      (by filename) and repointed at that file; an unmatched one is left absolute.
  #
  # The matching itself is delegated to an injected `resolver` (see {ImportLinkResolver}) that knows
  # the imported records, so this class stays a pure HTML transform. Only the `href` value is touched;
  # the surrounding markup is left byte-for-byte intact (a regex rewrite rather than a parse/reserialize
  # round-trip, matching how the importer already edits embedded `<img>` tags).
  class LinkCorrector
    # Captures an `<a … href="…">` (or single-quoted): $1 = everything up to and including `href=`,
    # $2 = the quote, $3 = the URL. Non-greedy URL, so it stops at the closing quote.
    HREF = /(<a\b[^>]*?\bhref\s*=\s*)(["'])(.*?)\2/im

    # @param original_domain [String] the source platform host (e.g. `participer.arcueil.fr`); a full
    #   URL is accepted too, only its host is used. When blank, same-domain/relative rules are skipped.
    # @param resolver [#content_href, #file_href] resolves a Decidim URL to a Go Vocal href, or nil.
    def initialize(original_domain:, resolver:)
      @original_host = host_of(original_domain)
      @resolver = resolver
    end

    # Rewrites every `<a href>` in an HTML string, returning the corrected HTML (unchanged input is
    # returned as-is). Non-string / link-less input is passed straight through.
    def correct(html)
      return html unless html.is_a?(String) && html.include?('href')

      html.gsub(HREF) do
        prefix = Regexp.last_match(1)
        quote = Regexp.last_match(2)
        raw = Regexp.last_match(3)
        corrected = correct_href(CGI.unescapeHTML(raw))
        "#{prefix}#{quote}#{corrected ? CGI.escapeHTML(corrected) : raw}#{quote}"
      end
    end

    # Rewrites every value of a `{ locale => html }` multiloc, dropping nothing.
    def correct_multiloc(multiloc)
      return multiloc unless multiloc.is_a?(Hash)

      multiloc.transform_values { |html| correct(html) }
    end

    private

    attr_reader :original_host, :resolver

    # The corrected href, or nil to leave the original untouched.
    def correct_href(url)
      url = url.to_s.strip
      return nil if url.empty?

      if url.include?('external_url=')
        external_target(url)
      elsif url.include?('/rails/active_storage')
        resolver.file_href(url) || absolutize(url)
      elsif relative?(url) || same_domain?(url)
        resolver.content_href(url) || absolutize(url)
      end
      # else: a third-party absolute link — left as-is (nil).
    end

    # Rule 3: strip the Decidim redirect wrapper down to the URL it wraps. The `external_url` query
    # value is percent-encoded (sometimes doubly, e.g. a trailing `%2520`); one unescape yields the
    # usable target. Returns nil (leave as-is) if there's nothing after the parameter.
    def external_target(url)
      target = url.split('external_url=', 2).last.to_s
      target = target.split('&', 2).first.to_s # drop any trailing query params on the wrapper
      decoded = CGI.unescape(target).strip
      decoded.empty? ? nil : decoded
    end

    # Rule 2 fallback: a same-domain/relative link that matched no imported content keeps pointing at
    # the original site — relative paths are made absolute against the original domain so they don't
    # resolve against the new one.
    def absolutize(url)
      return url unless relative?(url)
      return nil if original_host.nil? # no domain to build against → leave the relative link untouched

      "https://#{original_host}#{url}"
    end

    def relative?(url)
      url.start_with?('/') && !url.start_with?('//')
    end

    def same_domain?(url)
      return false if original_host.nil?

      host = host_of(url)
      !host.nil? && host == original_host
    end

    # The bare host of a URL or domain string, lowercased and without a leading `www.`; nil if blank
    # or unparseable.
    def host_of(value)
      str = value.to_s.strip
      return nil if str.empty?

      host = str.include?('//') ? URI.parse(str).host : str[%r{\A([^/]+)}, 1]
      host&.downcase&.delete_prefix('www.')
    rescue URI::InvalidURIError
      nil
    end
  end
end
