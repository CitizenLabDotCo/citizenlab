# frozen_string_literal: true

class TextImageService < ContentImageService
  BASE64_REGEX = %r{^data:image/([a-zA-Z]*);base64,.*$}

  protected

  def decode_content(content, raise_on_error: false)
    case content
    when Hash then content.transform_values { |v| decode_content(v, raise_on_error:) }
    when String then decode_string!(content)
    when nil then nil
    else raise ArgumentError, "Invalid content type: #{content.class}"
    end
  rescue DecodingError => e
    raise if raise_on_error

    log_decoding_error(e)
    UndecodableContent.new(content, e)
  end

  def encode_content(content)
    case content
    when nil then nil
    when UndecodableContent then content.original_content
    when Nokogiri::HTML::DocumentFragment then content.to_s
    when Hash then content.transform_values { |v| encode_content(v) }
    else raise ArgumentError, "Invalid content type: #{content.class}"
    end
  end

  # Decodes the given HTML string into a Nokogiri document.
  # @raise [DecodingError] if the HTML string is not valid.
  # @param html_string [String, nil] the HTML string to decode. `nil` values are treated
  #   as empty strings.
  # @return [Nokogiri::HTML::DocumentFragment] the decoded HTML document.
  def decode_string!(html_string)
    html_doc = Nokogiri::HTML.fragment html_string
    raise ContentImageService::DecodingError.new parse_errors: html_doc.errors if html_doc.errors.any?

    html_doc
  end

  # Returns the image elements in the given HTML document.
  # @return [Enumerable<Nokogiri::XML::Node>] the image elements.
  def image_elements(content)
    case content
    when UndecodableContent, nil then []
    when Nokogiri::HTML::DocumentFragment then content.css('img')
    when Hash then content.values.flat_map { |v| image_elements(v) }
    else raise ArgumentError, "Invalid content type: #{content.class}"
    end
  end

  def content_image_class
    TextImage
  end

  def image_attributes(html_doc, imageable, field)
    { imageable: imageable, imageable_field: field }.tap do |img_atrs|
      img_src = get_attribute html_doc, image_attribute_for_element
      img_key = img_src.match?(BASE64_REGEX) ? :image : :remote_image_url
      img_atrs[img_key] = img_src
    end
  end

  def attribute?(html_doc, image_attribute)
    html_doc.has_attribute? image_attribute
  end

  def get_attribute(html_doc, image_attribute)
    html_doc.attr image_attribute
  end

  def set_attribute!(html_doc, attribute, value)
    html_doc.set_attribute attribute, value
  end

  def remove_attribute!(html_doc, attribute)
    html_doc.remove_attribute attribute
  end

  def code_attribute_for_element
    'data-cl2-text-image-text-reference'
  end

  def code_attribute_for_model
    'text_reference'
  end

  def could_include_images?(encoded_content)
    case encoded_content
    when String then encoded_content.include?(code_attribute_for_element)
    when Hash then encoded_content.values.any? { |v| could_include_images?(v) }
    else raise ArgumentError, "Invalid content type: #{encoded_content.class}"
    end
  end

  def precompute_for_rendering(imageable)
    @precomputed_text_images = TextImage.where(imageable: imageable).index_by do |ti|
      ti[code_attribute_for_model]
    end
  end

  def fetch_content_image(code)
    @precomputed_text_images[code] || content_image_class.find_by(code_attribute_for_model => code)
  end

  class << self
    private

    def define_association(imageable_class, association_name, field)
      imageable_class.has_many(
        association_name,
        -> { where(imageable_field: field) },
        as: :imageable,
        dependent: :destroy,
        class_name: 'TextImage'
      )
    end
  end
end
