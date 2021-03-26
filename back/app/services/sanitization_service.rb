# frozen_string_literal: true

class SanitizationService
  # https://blog.arkency.com/2015/09/sanitizing-html-input-youtube-iframes/

  EDITOR_STRUCTURE_TAGS = %w[div p h2 h3 ol ul].freeze

  SANITIZER = Rails::Html::SafeListSanitizer.new

  private_constant :SANITIZER

  def sanitize(text, features)
    scrubber = IframeScrubber.new(features)

    sanitized = SANITIZER.sanitize(
      text,
      scrubber: scrubber
    )
    if sanitized == text
      sanitized
    else
      sanitize sanitized, features
    end
  end

  def sanitize_multiloc(multiloc, features)
    multiloc.each_with_object({}) do |(locale, text), output|
      output[locale] = sanitize(text, features)
    end
  end

  def remove_multiloc_empty_trailing_tags(multiloc)
    multiloc.each_with_object({}) do |(locale, text), output|
      output[locale] = remove_empty_trailing_tags(text)
    end
  end

  #
  # Remove any empty `EDITOR_STRUCTURE_TAGS` positioned as last children of an html string
  # and returns the resulting html string.
  #
  # ===== Examples
  #
  #   sanitation_service.remove_empty_trailing_tags('<h1>Nice</h1><p></p>') # => '<h1>Nice</h1>'
  #   sanitation_service.remove_empty_trailing_tags('<h1>Nice</h1><h2><br></h2>') # => '<h1>Nice</h1>'
  #

  def remove_empty_trailing_tags(html)
    html = remove_hidden_spaces(html)

    Nokogiri::HTML.fragment(html).yield_self do |doc|
      return html if doc.errors.any?

      while (node = last_structure_node(doc))
        with_content?(node) ? break : node.remove
      end

      doc.to_s
    end
  end

  def linkify_multiloc(multiloc)
    multiloc.each_with_object({}) do |(locale, text), output|
      output[locale] = linkify(text) if text
    end
  end

  def linkify(html)
    Rinku.auto_link(html, :all, 'target="_blank"', nil, Rinku::AUTOLINK_SHORT_DOMAINS)
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
    html&.gsub!('&nbsp;', ' ')
    html&.gsub!('&#65279;', '')
    html
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
        attributes: %w[type]
      },
      decoration: {
        tags: %w[b u i em strong],
        attributes: %w[]
      },
      link: {
        tags: %w[a],
        attributes: %w[href target]
      },
      image: {
        tags: %w[img],
        attributes: %w[src style width height data-align alt data-cl2-text-image-text-reference]
      },
      video: {
        tags: %w[iframe],
        attributes: %w[class frameborder allowfullscreen src data-blot-formatter-unclickable-bound width height data-align style]
      },
      mention: {
        tags: %w[span],
        attributes: %w[class data-user-id data-user-slug]
      }
    }.freeze

    VIDEO_WHITELIST = [
      %r{\A(?:http(?:s?):)?//(?:www\.)?youtu(?:be\.com/(?:watch\?v=|embed/)|\.be/)([\w\-\_]*)},
      %r{\A(?:http(?:s?):)?//(?:www\.)?(?:player\.vimeo\.com/video|vimeo\.com)/(\d+)(?:|/\?)},
      %r{\A(?:http(?:s?):)?//fast.wistia.net/embed/iframe/([\w\-\_]*)(?:|/\?)},
      %r{\A(?:http(?:s?):)?//(?:www\.)?dailymotion\.com/embed/video/?(.+)}
    ].freeze

    private_constant :EDITOR_FEATURES, :VIDEO_WHITELIST

    attr_reader :tags, :attributes

    def initialize(features)
      super()
      features_w_default = features.concat([:default])
      @tags = features_w_default.flat_map { |f| EDITOR_FEATURES[f][:tags] }.uniq
      @attributes = features_w_default.flat_map { |f| EDITOR_FEATURES[f][:attributes] }.uniq
    end

    def allowed_node?(node)
      return iframe_allowed? && video_whitelisted?(node) if node.name == 'iframe'

      tags.include? node.name
    end

    private

    def video_whitelisted?(node)
      VIDEO_WHITELIST.any? { |regex| (node['src'] =~ regex)&.zero? }
    end

    def iframe_allowed?
      tags.include? 'iframe'
    end
  end
end
