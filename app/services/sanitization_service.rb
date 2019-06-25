class SanitizationService

  @@sanitizer = Rails::Html::WhiteListSanitizer.new
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
      attributes: %w(src style width height data-align),
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


  def sanitize text, features
    features_w_default = features.concat([:default])
    @@sanitizer.sanitize(
      text, 
      tags: features_w_default.flat_map{|f| @@editor_features[f][:tags]}.uniq,
      attributes: features_w_default.flat_map{|f| @@editor_features[f][:attributes]}.uniq,
    )
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

end