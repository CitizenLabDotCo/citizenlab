# frozen_string_literal: true

class ContentImageService
  class DecodingError < StandardError
    def initialize(options = {})
      super
      @parse_errors = options[:parse_errors]
    end

    attr_reader :parse_errors
  end

  def swap_data_images_multiloc(multiloc, imageable: nil, field: nil)
    multiloc.each_with_object({}) do |(locale, encoded_content), output|
      output[locale] = swap_data_images encoded_content, imageable: imageable, field: field
    end
  end

  def swap_data_images(encoded_content, imageable: nil, field: nil)
    content = begin
      decode_content encoded_content
    rescue DecodingError => e
      log_decoding_error e
      return encoded_content
    end

    image_elements(content).each do |img_elt|
      next unless attribute? img_elt, image_attribute_for_element

      unless attribute? img_elt, code_attribute_for_element
        content_image = content_image_class.create! image_attributes(img_elt, imageable, field)
        set_attribute! img_elt, code_attribute_for_element, content_image[code_attribute_for_model]
      end
      remove_attribute! img_elt, image_attribute_for_element
    end

    encode_content content
  end

  def render_data_images_multiloc(multiloc, imageable: nil, field: nil)
    return multiloc if multiloc.blank?
    return multiloc if !multiloc.values.any? { |encoded_content| could_include_images?(encoded_content) }

    precompute_for_rendering_multiloc multiloc, imageable, field

    multiloc.each_with_object({}) do |(locale, encoded_content), output|
      output[locale] = render_data_images encoded_content, imageable: imageable, field: field
    end
  end

  def render_data_images(encoded_content, imageable: nil, field: nil)
    content = decode_content encoded_content
    # precompute_for_rendering content, imageable, field

    image_elements(content).each do |img_elt|
      next unless attribute? img_elt, code_attribute_for_element

      code = get_attribute img_elt, code_attribute_for_element
      content_image = fetch_content_image code
      if content_image.present?
        set_attribute! img_elt, image_attribute_for_element, content_image_url(content_image)
      else
        log_content_image_not_found code, imageable, field
      end
    end
    encode_content content
  end

  protected

  def decode_content(encoded_content)
    # No encoding by default.
    encoded_content
  end

  def encode_content(decoded_content)
    # No encoding by default.
    decoded_content
  end

  def image_elements(_content)
    raise NotImplementedError
  end

  def content_image_class
    raise NotImplementedError
  end

  def image_attributes(_img_elt, _imageable, _field)
    raise NotImplementedError
  end

  def attribute?(img_elt, image_attribute)
    # Hash representation by default.
    img_elt.key? image_attribute
  end

  def get_attribute(img_elt, image_attribute)
    # Hash representation by default.
    img_elt[image_attribute]
  end

  def set_attribute!(img_elt, attribute, value)
    # Hash representation by default.
    img_elt[attribute] = value
  end

  def remove_attribute!(img_elt, attribute)
    # Hash representation by default.
    img_elt.delete attribute
  end

  def code_attribute_for_element
    raise NotImplementedError
  end

  def image_attribute_for_element
    'src'
  end

  def code_attribute_for_model
    'code'
  end

  def could_include_images?(_encoded_content)
    true
  end

  def precompute_for_rendering_multiloc(_multiloc, _imageable, _field); end

  def fetch_content_image(code)
    content_image_class.find_by code_attribute_for_model => code
  end

  def content_image_url(content_image)
    content_image.image.url
  end

  private

  def log_decoding_error(error)
    Sentry.capture_exception(error, extra: { parse_errors: error.parse_errors })
  end

  def log_content_image_not_found(code, imageable, field)
    Sentry.capture_exception(
      Exception.new('No content image found with code'),
      extra: {
        code: code,
        imageable_type: imageable.class,
        imageable_id: imageable.id,
        imageable_created_at: imageable.created_at,
        imageable_field: field
      }
    )
  end
end
