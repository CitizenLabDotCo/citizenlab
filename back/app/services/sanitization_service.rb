# frozen_string_literal: true

# Sanitizes external input that is potentially malicious or not wanted for other reasons.
class SanitizationService
  # https://blog.arkency.com/2015/09/sanitizing-html-input-youtube-iframes/

  EDITOR_STRUCTURE_TAGS = %w[div p h2 h3 ol ul].freeze

  # Each `strip_to_plain_text` pass peels one layer of entity encoding; real text settles in 1-3.
  PLAIN_TEXT_PASSES = 5

  SANITIZER = Rails::Html::SafeListSanitizer.new

  private_constant :SANITIZER

  # Sanitizes a string from malicious and unwanted input.
  # @param sanitize [String] string input to be sanitized
  # @param features [Array<Symbol>] A list of allowed features
  # See {IframeScrubber, EDITOR_FEATURES} for the list of allowed tags and attributes.
  def sanitize(text, features)
    return nil if text.nil?

    scrubber = IframeScrubber.new(features)
    sanitized = SANITIZER.sanitize(text, scrubber: scrubber)

    if sanitized == text
      sanitized
    else
      sanitize(sanitized, features)
    end
  end

  def sanitize_multiloc(multiloc, features)
    multiloc.transform_values do |text|
      sanitize(text, features)
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
    Rinku.auto_link(html, :all, 'target="_blank" rel="noreferrer noopener nofollow"', nil, Rinku::AUTOLINK_SHORT_DOMAINS)
  end

  # The pipeline `Idea` and `Comment` apply to their bodies, shared so that anything reprocessing
  # a stored body (machine translations, the stored-XSS purge) applies the same rules.
  #
  # Sanitizing before linkifying is load-bearing, but what it buys depends on `features`. Where
  # `:link` is absent (`Comment`), the author's anchors are dropped and rebuilt from the visible
  # text, so an href cannot disagree with its label. Where `:link` is present (`Idea`), anchors
  # survive as written: the href is scheme-scrubbed, but it need not match the text it labels.
  #
  # A nil value comes back as '' rather than nil. Long-standing behaviour - do not add a guard.
  def sanitize_body(html, features)
    html = sanitize(html, features)
    html = remove_empty_trailing_tags(html)
    linkify(html)
  end

  def sanitize_body_multiloc(multiloc, features)
    multiloc.transform_values { |html| sanitize_body(html, features) }
  end

  # Reduces text to plain text: no markup, and no entity encoding of the text that survives.
  #
  # `full_sanitizer` alone entity-encodes what it keeps ("Fish & chips" -> "Fish &amp; chips"), so
  # decode after each pass, and repeat until the value settles - otherwise a payload survives by
  # hiding behind its own encoding (`&lt;script&gt;`).
  def strip_to_plain_text(text)
    return nil if text.nil?

    full_sanitizer = ActionView::Base.full_sanitizer

    PLAIN_TEXT_PASSES.times do
      decoded = CGI.unescapeHTML(full_sanitizer.sanitize(text))
      return decoded if decoded == text

      text = decoded
    end

    # More layers of encoding than we have passes (`&amp;amp;amp;amp;amp;lt;script&gt;`). Return
    # the escaped form, which renders as literal text rather than markup.
    full_sanitizer.sanitize(text)
  end

  # The pipeline for a plain-text multiloc field, i.e. a title. Shared so that every model whose
  # title reaches an HTML render path strips it by the same rule.
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
      mention: {
        tags: %w[span],
        attributes: %w[class data-user-id data-link-profile]
      },
      table: {
        tags: %w[table thead tbody tr th td tfoot],
        attributes: %w[class style width border border-collapse display border-color padding text-align]
      }
    }.freeze

    private_constant :EDITOR_FEATURES
    attr_reader :tags, :attributes

    def initialize(features = [])
      super()
      features_w_default = features + [:default]
      @tags = features_w_default.flat_map { |f| EDITOR_FEATURES[f][:tags] }.uniq
      @attributes = features_w_default.flat_map { |f| EDITOR_FEATURES[f][:attributes] }.uniq
    end

    def allowed_node?(node)
      return iframe_allowed? && UrlValidationService.new.video_whitelisted?(node['src']) if node.name == 'iframe'

      ensure_nofollow(node) if node.name == 'a'
      tags.include? node.name
    end

    private

    def iframe_allowed?
      tags.include? 'iframe'
    end

    def ensure_nofollow(node)
      node.scrub!(:nofollow)
    end
  end
end
