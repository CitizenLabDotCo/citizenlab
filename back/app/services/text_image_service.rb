# frozen_string_literal: true

class TextImageService < ContentImageService
  BASE64_REGEX = %r{^data:image/([a-zA-Z]*);base64,.*$}.freeze

  protected

  def decode_content(html_string)
    html_doc = Nokogiri::HTML.fragment html_string
    raise ContentImageService::DecodingError.new parse_errors: html_doc.errors if html_doc.errors.any?

    html_doc
  end

  def encode_content(html_doc)
    html_doc.to_s
  end

  def image_elements(html_doc)
    html_doc.css 'img'
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

  def could_include_images?(html_string)
    html_string.include? code_attribute_for_element
  end

  def precompute_for_rendering(_multiloc, imageable, _field)
    @precomputed_text_images = imageable.text_images.index_by do |ti|
      ti[code_attribute_for_model]
    end
  end

  def fetch_content_image(code)
    @precomputed_text_images[code] || content_image_class.find_by(code_attribute_for_model => code)
  end
end
