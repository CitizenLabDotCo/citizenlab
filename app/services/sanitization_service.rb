class SanitizationService
  #https://blog.arkency.com/2015/09/sanitizing-html-input-youtube-iframes/

  @@sanitizer = Rails::Html::WhiteListSanitizer.new

  class IframeScrubber < Rails::Html::PermitScrubber
    @@editor_features = {
      default: {
        tags: %w(p br),
        attributes: %w(),
      },
      title: {
        tags: %w(h2 h3),
        attributes: %w(),
      },
      alignment: {
        tags: %w(),
        attributes: %w(class),
      },
      list: {
        tags: %w(ol ul li),
        attributes: %w(type),
      },
      decoration: {
        tags: %w(b u i em strong),
        attributes: %w(),
      },
      link: {
        tags: %w(a),
        attributes: %w(href target),
      },
      image: {
        tags: %w(img),
        attributes: %w(src style width height data-align alt data-cl2-text-image-text-reference),
      },
      video: {
        tags: %w(iframe),
        attributes: %w(class frameborder allowfullscreen src data-blot-formatter-unclickable-bound width height data-align style),
      },
      mention: {
        tags: %w(span),
        attributes: %w(class data-user-id data-user-slug)
      }
    }

    @@video_whitelist = [
      /\A(?:http(?:s?):)?\/\/(?:www\.)?youtu(?:be\.com\/(?:watch\?v=|embed\/)|\.be\/)([\w\-\_]*)/,
      /\A(?:http(?:s?):)?\/\/(?:www\.)?(?:player\.vimeo\.com\/video|vimeo\.com)\/(\d+)(?:|\/\?)/,
      /\A(?:http(?:s?):)?\/\/fast.wistia.net\/embed\/iframe\/([\w\-\_]*)(?:|\/\?)/,
      /\A(?:http(?:s?):)?\/\/(?:www\.)?dailymotion\.com\/embed\/video\/?(.+)/
    ]

    def initialize features
      features_w_default = features.concat([:default])
      self.tags = features_w_default.flat_map{|f| @@editor_features[f][:tags]}.uniq
      self.attributes = features_w_default.flat_map{|f| @@editor_features[f][:attributes]}.uniq
    end

    def allowed_node?(node)
      if node.name == 'iframe'
        return (tags.include? 'iframe') && (@@video_whitelist.any? { |regex| (node['src'] =~ regex) == 0 })
      end

      tags.include? node.name
    end
  end

  def sanitize text, features
    scrubber = IframeScrubber.new(features)

    sanitized = @@sanitizer.sanitize(
      text,
      scrubber: scrubber
    )
    if sanitized == text
      sanitized
    else
      sanitize sanitized, features
    end
  end

  def sanitize_multiloc multiloc, features
    multiloc.each_with_object({}) do |(locale, text), output|
      output[locale] = sanitize(text, features)
    end
  end

  def remove_empty_paragraphs_multiloc multiloc
    multiloc.each_with_object({}) do |(locale, text), output|
      output[locale] = remove_empty_paragraphs(text)
    end
  end

  def remove_empty_paragraphs html
    doc = Nokogiri::HTML.fragment(html)
    if doc.errors.any?
      html
    else
      while (last_p = doc.css('p:last-child')).any?
        if last_p.children.empty? || last_p.children.map(&:name).uniq == ['br']
          last_p.remove
        else
          break
        end
      end
      doc.to_s
    end
  end

  def linkify_multiloc multiloc
    multiloc.each_with_object({}) do |(locale, text), output|
      output[locale] = linkify(text) if text
    end
  end

  def linkify html
    Rinku.auto_link(html, :all, 'target="_blank"', nil, Rinku::AUTOLINK_SHORT_DOMAINS)
  end

  def html_with_content? text_or_html
    html = Nokogiri::HTML.fragment(text_or_html)
    html.text.present? || !!%w(img iframe).any?{|tag| html.at tag}
  end
end
