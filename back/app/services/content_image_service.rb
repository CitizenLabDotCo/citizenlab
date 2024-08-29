# frozen_string_literal: true

# This service is used to extract images embedded in some content and store them in as a
# separate model. It should not be instantiated directly, but be subclassed to implement
# the specific logic for each type of content.
#
# This, sort of, implements an implicit mechanism to upload images. The typical use case
# is that some content is created on the platform with references to images. The service
# is then used to extract those references and store the images by instantiating a
# separate image model. The image references are then replaced by references to the image
# model.
#
# In practice, this class implements two main operations:
# - The extraction mechanism described above (see {ContentImageService#swap_data_images}).
# - The rendering mechanism which re-injects the images into the content by replacing the
#   references to the model by the actual image data
#   (see {ContentImageService#render_data_images}).
class ContentImageService
  class DecodingError < StandardError
    def initialize(options = {})
      super
      @parse_errors = options[:parse_errors]
    end

    attr_reader :parse_errors
  end

  # Applies {#swap_data_images} to each multiloc value in the given multiloc.
  def swap_data_images_multiloc(multiloc, imageable: nil, field: nil)
    multiloc.transform_values do |encoded_content|
      swap_data_images encoded_content, imageable: imageable, field: field
    end
  end

  # Extracts and remove image data from the content, stores it in a separate image model,
  # and updates the original content to reference the image model instead.
  def swap_data_images(encoded_content, imageable: nil, field: nil)
    content = begin
      decode_content encoded_content
    rescue DecodingError => e
      log_decoding_error e
    end
    return encoded_content if !content

    image_elements(content).each do |img_elt|
      next if image_attributes_for_element.none? { |elt_atr| attribute? img_elt, elt_atr }

      if !attribute?(img_elt, code_attribute_for_element) && image_attributes(img_elt, imageable, field).present?
        content_image = content_image_class.create! image_attributes(img_elt, imageable, field)
        set_attribute! img_elt, code_attribute_for_element, content_image[code_attribute_for_model]
      end
      image_attributes_for_element.each do |elt_atr|
        remove_attribute! img_elt, elt_atr
      end
    end

    encode_content content
  end

  # Applies {#render_data_images} to each multiloc value in the given multiloc.
  def render_data_images_multiloc(multiloc, imageable: nil, field: nil)
    return multiloc if multiloc.blank?
    return multiloc if multiloc.values.none? { |encoded_content| could_include_images?(encoded_content) }

    precompute_for_rendering_multiloc multiloc, imageable, field

    multiloc.transform_values do |encoded_content|
      render_data_images encoded_content, imageable: imageable, field: field
    end
  end

  # Replaces references to image models in the content by actual image data.
  def render_data_images(encoded_content, imageable: nil, field: nil)
    content = decode_content encoded_content
    precompute_for_rendering content, imageable, field

    image_elements(content).each do |img_elt|
      next if !attribute? img_elt, code_attribute_for_element

      code = get_attribute img_elt, code_attribute_for_element
      # Content image is an instance of {#content_image_class}.
      content_image = fetch_content_image code
      if content_image.present?
        set_image_attributes! img_elt, content_image
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

  # The model class used to persist the image data.
  # @return [Class]
  def content_image_class
    raise NotImplementedError
  end

  # Computes the attributes that should be used to instantiate the image model given an
  # image element. The current implementation is a bit coupled with the TextImage model.
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

  def set_image_attributes!(img_elt, content_image)
    set_attribute! img_elt, image_attribute_for_element, content_image_url(content_image)
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

  def image_attributes_for_element
    [image_attribute_for_element]
  end

  def code_attribute_for_model
    'code'
  end

  def could_include_images?(_encoded_content)
    true
  end

  def precompute_for_rendering_multiloc(_multiloc, _imageable, _field); end

  def precompute_for_rendering(content, imageable, field); end

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
        imageable_type: imageable&.class,
        imageable_id: imageable&.id,
        imageable_created_at: imageable&.created_at,
        imageable_field: field
      }
    )
  end
end
