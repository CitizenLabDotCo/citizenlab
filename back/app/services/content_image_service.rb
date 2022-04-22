class ContentImageService
  def swap_data_images(imageable, field)
    multiloc = imageable.send field
    multiloc.each_with_object({}) do |(locale, encoded_content), output|
      content = decode_content encoded_content
      return multiloc if content.nil?

      image_elements(content).each do |img_elt|
        next if !attribute? img_elt, image_attribute_for_element

        unless attribute? img_elt, code_attribute_for_element
          content_image = content_image_class.create! image_attributes(img_elt, imageable, field)
          set_attribute! img_elt, code_attribute_for_element, content_image[code_attribute_for_model]
        end
        remove_attribute! img_elt, image_attribute_for_element
      end

      output[locale] = encode_content content
    end
  end

  def render_data_images(imageable, field)
    multiloc = imageable.send field
    return multiloc unless multiloc.values.any? { |encoded_content| could_include_images?(encoded_content) }

    precompute_for_rendering multiloc, imageable, field

    multiloc.each_with_object({}) do |(locale, encoded_content), output|
      content = decode_content encoded_content

      image_elements(content).each do |img_elt|
        next unless attribute? img_elt, code_attribute_for_element

        code = get_attribute img_elt, code_attribute_for_element
        content_image = fetch_content_image code
        if content_image.present?
          set_attribute! img_elt, image_attribute_for_element, content_image.image.url
        else
          Sentry.capture_exception( # TODO: in separate method
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
      output[locale] = encode_content content
    end
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

  def precompute_for_rendering(_multiloc, _imageable, _field); end

  def fetch_content_image(code)
    content_image_class.find_by code_attribute_for_model => code
  end
end
