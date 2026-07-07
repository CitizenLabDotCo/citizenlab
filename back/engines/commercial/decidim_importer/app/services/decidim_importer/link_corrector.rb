# frozen_string_literal: true

module DecidimImporter
  # Decides what a single link embedded in imported rich text should become. Decidim bodies link back
  # to the *source* platform in ways that would dead-end on Go Vocal, so each URL is classified by
  # these rules (in order):
  #
  #   1. The source platform's domain is supplied by the caller (`original_domain`).
  #   2. A relative link, or an absolute one on the original domain, is matched against the imported
  #      content by its Decidim URL (via the injected `resolver`) — e.g. `…/processes/<slug>/…` →
  #      `/projects/<slug>`. A same-domain link that matches nothing *should* be repointed but can't be,
  #      so it's flagged **broken**.
  #   3. A Decidim external-link redirect (`…/link?external_url=<encoded>`) is unwrapped to just the
  #      target URL it wraps (always resolvable).
  #   4. An Active Storage blob link (`…/rails/active_storage/…`) is matched to an imported attachment
  #      (by filename); an unmatched one is flagged **broken**.
  #
  # A third-party link (neither relative, on the original domain, a redirect, nor a blob) is left
  # alone. This class only *decides*; recording the old→new mapping and applying it is {LinkMap}'s job.
  class LinkCorrector
    # @param original_domain [String] the source platform host (e.g. `participer.arcueil.fr`); a full
    #   URL is accepted too, only its host is used. When blank, same-domain matching is skipped.
    # @param resolver [#content_href, #file_id] resolves a Decidim URL to a Go Vocal href / file id, or nil.
    def initialize(original_domain:, resolver:)
      @original_host = host_of(original_domain)
      @resolver = resolver
    end

    # Classifies a single (HTML-entity-decoded) URL. Returns:
    #   * `nil` — leave the link untouched (third-party, or no rule applies)
    #   * `{ new: <url> }` — replace the link with this URL
    #   * `{ file_id: <id> }` — replace with the imported file's URL (resolved from the id after import)
    #   * `{ broken: true }` — the link should be repointed at imported content, but none matched
    def resolve(url)
      url = url.to_s.strip
      return nil if url.empty?

      if url.include?('external_url=')
        target = external_target(url)
        target ? { new: target } : nil
      elsif url.include?('/rails/active_storage')
        file_id = @resolver.file_id(url)
        file_id ? { file_id: file_id } : { broken: true }
      elsif relative?(url) || same_domain?(url)
        content = @resolver.content_href(url)
        content ? { new: content } : { broken: true }
      end
      # else: a third-party absolute link — left as-is (nil).
    end

    private

    # Rule 3: strip the Decidim redirect wrapper down to the URL it wraps. The `external_url` query
    # value is percent-encoded (sometimes doubly, e.g. a trailing `%2520`); one unescape yields the
    # usable target. Returns nil (leave as-is) if there's nothing after the parameter.
    def external_target(url)
      target = url.split('external_url=', 2).last.to_s.split('&', 2).first.to_s
      decoded = CGI.unescape(target).strip
      decoded.empty? ? nil : decoded
    end

    def relative?(url)
      url.start_with?('/') && !url.start_with?('//')
    end

    def same_domain?(url)
      return false if @original_host.nil?

      host = host_of(url)
      !host.nil? && host == @original_host
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
