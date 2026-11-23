# frozen_string_literal: true

# Sanitizes external input that is potentially malicious or not wanted for other reasons.
class SanitizationService
  # https://blog.arkency.com/2015/09/sanitizing-html-input-youtube-iframes/

  EDITOR_STRUCTURE_TAGS = %w[div p h2 h3 ol ul].freeze

  # Each `strip_to_plain_text` pass peels one layer of entity encoding; real text settles in 1-3.
  PLAIN_TEXT_PASSES = 5

  NBSP = "\u00A0"

  # What `linkify` builds an href from, and so the only links a body may show as their own URL.
  LINKIFIABLE_HREF = %r{\A(https?://|mailto:)}i

  # What `linkify` puts on a link it builds, and so what a kept link carries too. `target="_blank"`
  # without `noopener` hands the opened page control of this tab.
  LINK_ATTRIBUTES = { 'target' => '_blank', 'rel' => 'noreferrer noopener nofollow' }.freeze

  SANITIZER = Rails::Html::SafeListSanitizer.new

  private_constant :SANITIZER

  # Sanitizes a string from malicious and unwanted input.
  # @param text [String] string input to be sanitized
  # @param features [Array<Symbol>] A list of allowed features
  # @param host [String, nil] The host of the platform the text belongs to. Required by the `embed` feature.
  # See {IframeScrubber, EDITOR_FEATURES} for the list of allowed tags and attributes.
  def sanitize(text, features, host: nil)
    return nil if text.nil?

    scrubber = IframeScrubber.new(features, host: host)
    sanitized = SANITIZER.sanitize(text, scrubber: scrubber)

    if sanitized == text
      sanitized
    else
      sanitize(sanitized, features, host: host)
    end
  end

  def sanitize_multiloc(multiloc, features, host: nil)
    multiloc.transform_values do |text|
      sanitize(text, features, host: host)
    end
  end

  def remove_multiloc_empty_trailing_tags(multiloc)
    multiloc.transform_values do |text|
      remove_empty_trailing_tags text
    end
  end

  # Remove any empty `EDITOR_STRUCTURE_TAGS` positioned as last children of an html string
  # and returns the resulting html string.
  #
  # ===== Examples
  #
  #   sanitation_service.remove_empty_trailing_tags('<h1>Nice</h1><p></p>') # => '<h1>Nice</h1>'
  #   sanitation_service.remove_empty_trailing_tags('<h1>Nice</h1><h2><br></h2>') # => '<h1>Nice</h1>'
  def remove_empty_trailing_tags(html)
    html = remove_hidden_spaces(html)

    Nokogiri::HTML.fragment(html).then do |doc|
      return html if doc.errors.any?

      while (node = last_structure_node(doc))
        with_content?(node) ? break : node.remove
      end

      doc.to_s
    end
  end

  def remove_multiloc_hidden_elements(multiloc)
    multiloc.transform_values do |text|
      remove_hidden_elements text
    end
  end

  # `sanitize` drops a tag it does not allow but keeps its text, so content the browser never shows
  # (a `<style>`, a `<script>`, a `<noscript>`…) would show up as visible text. This removes those
  # elements with their content. `<textarea>` and `<xmp>` are left to `sanitize`: browsers show their text.
  def remove_hidden_elements(html)
    return html if html.blank?

    Nokogiri::HTML.fragment(html).then do |doc|
      doc.css('style, script, noscript, template, title, noembed, noframes').each(&:remove)
      doc.to_s
    end
  end

  # Turns URLs in text into HTML links
  # @param multiloc [Hash] A multiloc hash, its values will be linkified.
  # @return [Hash] The multiloc hash with it's content (values) being transformed into links.
  def linkify_multiloc(multiloc)
    multiloc.each_with_object({}) do |(locale, text), output|
      output[locale] = linkify(text) if text
    end
  end

  # Turns URLs in text into HTML links
  # @param html [String] Text that will be linkified.
  # @return [String] The text with it's content being transformed into links.
  def linkify(html)
    attributes = LINK_ATTRIBUTES.map { |name, value| %(#{name}="#{value}") }.join(' ')
    Rinku.auto_link(html, :all, attributes, nil, Rinku::AUTOLINK_SHORT_DOMAINS)
  end

  # The pipeline for every rich-text field - bodies and descriptions - shared with anything
  # reprocessing a stored value (e.g. machine translations). Also the second half of
  # `sanitize_comment_body`.
  #
  # A nil value comes back as '', not nil. Long-standing behaviour - do not add a guard.
  def sanitize_body(html, features)
    html = sanitize(html, features)
    html = remove_empty_trailing_tags(html)
    linkify(html)
  end

  # The pipeline `Comment` applies to its body, shared with anything reprocessing a stored one
  # (e.g. machine translations). Only the href says where a click lands, so it is the side the
  # label is rebuilt from - an author can point `google.com` anywhere, and a translator rewrites
  # whatever label it can read.
  def sanitize_comment_body(html)
    sanitize_body(label_links_with_urls(html), Comment::BODY_SANITIZE_FEATURES)
  end

  def sanitize_comment_body_multiloc(multiloc)
    multiloc.transform_values { |html| sanitize_comment_body(html) }
  end

  # Rewrites a link's label to the URL it points at where the two disagree, leaving the href alone.
  # Attributes always come out as `linkify` writes them, so a kept link and a rebuilt one match.
  #
  # A link `linkify` could not have built is unwrapped to its text: relabelling it would show a
  # scheme the pipeline never produces, and keeping it would leave the label free to lie.
  def label_links_with_urls(html)
    return html if html.blank?

    doc = Nokogiri::HTML.fragment(html)
    doc.css('a[href]').each do |link|
      if link['href'].match?(LINKIFIABLE_HREF)
        link.content = link['href'].sub(/\Amailto:/i, '') unless label_matches_href?(link)
        LINK_ATTRIBUTES.each { |name, value| link[name] = value }
      else
        link.replace(Nokogiri::XML::Text.new(link.text, link.document))
      end
    end
    doc.to_s
  end

  def sanitize_body_multiloc(multiloc, features)
    multiloc.transform_values { |html| sanitize_body(html, features) }
  end

  # Reduces text to plain text: no markup, and no entity encoding of what survives.
  #
  # `full_sanitizer` alone entity-encodes what it keeps ("Fish & chips" -> "Fish &amp; chips"), so
  # decode after each pass and repeat until the value settles - otherwise a payload survives by
  # hiding behind its own encoding (`&lt;script&gt;`).
  #
  # `CGI.unescapeHTML` decodes numeric references and the five XML names, but the HTML5 serializer
  # also writes U+00A0 as `&nbsp;`, so that one needs decoding by hand. Callers render the result as
  # text and slug it, so an entity left standing reaches the reader as six literal characters.
  def strip_to_plain_text(text)
    return nil if text.nil?

    full_sanitizer = ActionView::Base.full_sanitizer

    PLAIN_TEXT_PASSES.times do
      decoded = CGI.unescapeHTML(full_sanitizer.sanitize(text)).gsub('&nbsp;', NBSP)
      return decoded if decoded == text

      text = decoded
    end

    # More encoding layers than passes: return the escaped form, which renders as literal text.
    full_sanitizer.sanitize(text)
  end

  # `strip_to_plain_text` across a multiloc - the rule every title-bearing model shares.
  def strip_multiloc_to_plain_text(multiloc)
    multiloc.transform_values { |text| strip_to_plain_text(text) }
  end

  def html_with_content?(text_or_html)
    html = Nokogiri::HTML.fragment(text_or_html)
    with_content?(html)
  end

  private

  #
  #
  # Returns the last node if it's tag name is included in `EDITOR_STRUCTURE_TAGS`.
  #

  def last_structure_node(doc)
    css_selector = EDITOR_STRUCTURE_TAGS.map { |tag| "#{tag}:last-child" }.join(', ')
    doc.at_css(css_selector)
  end

  def with_content?(node)
    node.text.present? || %w[img iframe].any? { |tag| node.at tag }
  end

  # A label tells the truth when linkifying it on its own rebuilds this very link, so the
  # `www.example.com` someone typed is left as they typed it. Asking `linkify` rather than comparing
  # by hand is the point: a label cannot look honest to this check and still point elsewhere.
  #
  # Both escapings come off first - the href is stored as it serialises, the label as a person reads
  # it - so an accent or an `&` does not read as disagreement.
  def label_matches_href?(link)
    built = linkify(link.text)[/href="([^"]*)"/, 1]
    built.present? && unescaped(built) == unescaped(link['href'])
  end

  def unescaped(url)
    CGI.unescape(CGI.unescapeHTML(url))
  end

  def remove_hidden_spaces(html)
    return unless html

    html.gsub('&nbsp;', ' ').gsub('&#65279;', '')
  end

  class IframeScrubber < Rails::Html::PermitScrubber
    EDITOR_FEATURES = {
      default: {
        tags: %w[p br],
        attributes: %w[]
      },
      title: {
        tags: %w[h2 h3],
        attributes: %w[]
      },
      alignment: {
        tags: %w[],
        attributes: %w[class]
      },
      list: {
        tags: %w[ol ul li],
        attributes: %w[type start]
      },
      decoration: {
        tags: %w[b u i em strong],
        attributes: %w[]
      },
      link: {
        tags: %w[a],
        attributes: %w[href target rel]
      },
      image: {
        tags: %w[img],
        attributes: %w[src style width height data-align alt title data-cl2-text-image-text-reference]
      },
      video: {
        tags: %w[iframe],
        attributes: %w[class frameborder allowfullscreen referrerpolicy src data-blot-formatter-unclickable-bound width height data-align style]
      },
      embed: {
        tags: %w[iframe],
        tag_attributes: {
          'iframe' => %w[src width height frameborder allowfullscreen style title loading referrerpolicy scrolling marginheight marginwidth]
        }
      },
      blocks: {
        tags: %w[h1 div],
        tag_attributes: { 'h1' => %w[class], 'div' => %w[class] }
      },
      mention: {
        tags: %w[span],
        attributes: %w[class data-user-id data-link-profile]
      },
      table: {
        tags: %w[table thead tbody tr th td tfoot],
        attributes: %w[class style width border border-collapse display border-color padding text-align]
      }
    }.freeze

    # Any https page but a Go Vocal platform's (see `embeddable?`). No control character or backslash, and
    # no whitespace in the host part or at either end: browsers drop or rewrite them, so the host they load
    # could differ from the one checked. A space after the host is only percent-encoded, so it is kept.
    EMBED_SRC = %r{\Ahttps://[^[:space:][:cntrl:]\\/?#]+(?:[/?#][^[:cntrl:]\\]*)?(?<!\s)\z}i

    # The domains Go Vocal platforms are hosted on. `Seo::UpdateGoogleHostJob` has its own copy, for
    # another decision (which hosts to verify with Google), so the two may change apart.
    PLATFORM_DOMAINS = %w[govocal.com citizenlab.co].freeze

    private_constant :EDITOR_FEATURES, :EMBED_SRC, :PLATFORM_DOMAINS
    attr_reader :features, :tags, :attributes, :tag_attributes, :host

    # A feature's `attributes` are kept on every allowed tag, its `tag_attributes` only on their own tag.
    # `host` is passed in rather than read from the current tenant, which is not always the one the text
    # belongs to (e.g. while a tenant is being created).
    def initialize(features = [], host: nil)
      raise ArgumentError, 'the embed feature needs the platform host' if features.include?(:embed) && host.blank?

      super()
      @host = host
      @features = features + [:default]
      @tags = @features.flat_map { |f| EDITOR_FEATURES[f][:tags] }.uniq
      @tag_attributes = @features.filter_map { |f| EDITOR_FEATURES[f][:tag_attributes] }
        .reduce({}) { |all, more| all.merge(more) { |_tag, mine, theirs| mine | theirs } }
      shared_attributes = @features.flat_map { |f| EDITOR_FEATURES[f][:attributes] || [] }
      @tag_only_attributes = @tag_attributes.values.flatten - shared_attributes
      @attributes = (shared_attributes + @tag_attributes.values.flatten).uniq
    end

    def allowed_node?(node)
      return iframe_allowed?(node['src']) if node.name == 'iframe'

      ensure_nofollow(node) if node.name == 'a'
      tags.include? node.name
    end

    private

    # `PermitScrubber` checks attributes against one list for every tag, so the ones kept for a
    # single tag are removed from the others first.
    def scrub_attributes(node)
      node.attribute_nodes.each do |attr|
        next unless @tag_only_attributes.include?(attr.name)

        attr.remove unless tag_attributes.fetch(node.name, []).include?(attr.name)
      end
      super
    end

    def iframe_allowed?(src)
      (features.include?(:video) && UrlValidationService.new.video_whitelisted?(src)) ||
        (features.include?(:embed) && embeddable?(src.to_s))
    end

    # Helper texts embed pages from other sites (maps…), never a Go Vocal platform's own pages.
    def embeddable?(src)
      return false unless EMBED_SRC.match?(src)

      embedded_host = Addressable::URI.parse(src).normalize.host
      return false if embedded_host.blank?
      return false if embedded_host == Addressable::URI.parse("https://#{host}").normalize.host

      PLATFORM_DOMAINS.none? { |domain| embedded_host == domain || embedded_host.end_with?(".#{domain}") }
    rescue Addressable::URI::InvalidURIError
      false
    end

    def ensure_nofollow(node)
      node.scrub!(:nofollow)
    end
  end
end
