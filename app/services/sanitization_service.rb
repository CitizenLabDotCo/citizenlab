class SanitizationService

  @@sanitizer = Rails::Html::WhiteListSanitizer.new
  @@editor_features = {
    default: {
      tags: %w(p br),
      attributes: %w(),
    },
    title: {
      tags: %w(h1 h2),
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

end