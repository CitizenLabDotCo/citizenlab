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

  # Wrapper for content that could not be decoded.
  # Preserves the original encoded content for round-trip safety and partial processing.
  class UndecodableContent
    attr_reader :original_content, :error

    def initialize(original_content, error = nil)
      @original_content = original_content
      @error = error
      freeze
    end

    def to_s
      "[UndecodableContent: #{original_content.class}]"
    end

    def inspect
      "#<UndecodableContent original_content=#{original_content.inspect[0..50]}... error=#{error&.class}>"
    end
  end

  # Extracts and remove image data from the content, stores it in a separate image model,
  # and updates the original content to reference the image model instead.
  def swap_data_images(encoded_content, imageable: nil, field: nil)
    content = decode_content(encoded_content)
    return encoded_content if content.is_a?(UndecodableContent) || content.blank?

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

  # Extracts image data from the content field of the given record, stores it in a
  # separate model, and updates the content field to reference the image model instead.
  # This method doesn't save the image models directly. Instead, it returns the record
  # with the updated content field and the new image models added to the association.
  #
  # IMPORTANT: This method requires the imageable model to have a `has_many` association
  # that lists all the image models it references. This is not currently the case for
  # +ContentBuilder::Layout+ and +ContentBuilder::LayoutImage images+. It uses
  # `association.build` to initialize image records and relies on the association's
  # auto-save behavior to persist them. This ensures that foreign keys are set correctly
  # when the records are saved.
  #
  # @param imageable [Imageable] The record that contains the content field.
  # @param field [String, Symbol] The name of the field in `imageable` containing the
  #   content to be processed.
  # @param association [Symbol, ActiveRecord::Associations::CollectionProxy] The
  #   association to/through which the new image models will be added.
  # @return [Imageable] The updated `imageable` object.
  def swap_data_images!(imageable, field, association)
    encoded_content = imageable.read_attribute(field)
    content = decode_content(encoded_content)
    return if content.is_a?(UndecodableContent) || content.blank?

    association = imageable.public_send(association) if association.is_a?(Symbol)

    image_elements(content).each do |img_elt|
      next if get_attribute(img_elt, code_attribute_for_element) # Image already stored.
      next if image_attributes_for_element.none? { |elt_atr| attribute? img_elt, elt_atr }
      next if (image_attrs = image_attributes(img_elt, imageable, field)).blank?

      image = association.build(image_attrs)

      set_attribute!(img_elt, code_attribute_for_element, image[code_attribute_for_model])
      image_attributes_for_element.each { |elt_atr| remove_attribute!(img_elt, elt_atr) }
    end

    imageable.write_attribute(field, encode_content(content))
    imageable
  end

  # Applies {#render_data_images} to each multiloc value in the given multiloc.
  def render_data_images_multiloc(multiloc, imageable: nil, field: nil)
    return multiloc if multiloc.blank?
    return multiloc if multiloc.values.none? { |encoded_content| could_include_images?(encoded_content) }

    precompute_for_rendering imageable

    multiloc.transform_values do |encoded_content|
      render_data_images encoded_content, imageable: imageable, field: field
    end
  end

  # Replaces references to image models in the content by actual image data.
  def render_data_images(encoded_content, imageable: nil, field: nil)
    content = decode_content(encoded_content, raise_on_error: true)
    precompute_for_rendering imageable

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

  # Decodes the given encoded content.
  # @param encoded_content [String] The content to decode.
  # @param raise_on_error [Boolean] Whether to raise DecodingError on failure.
  #   When false, returns UndecodableContent wrapper instead.
  # @return The decoded content, or UndecodableContent if decoding fails and raise_on_error is false.
  # @raise [DecodingError] if the content could not be decoded and raise_on_error is true.
  def decode_content(encoded_content, raise_on_error: false)
    encoded_content # No encoding by default.
  rescue DecodingError => e
    raise if raise_on_error

    log_decoding_error(e)
    UndecodableContent.new(encoded_content, e)
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

  def precompute_for_rendering(_imageable); end

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

  class << self
    # Convenience class method to set up automatic image extraction for a model.
    #
    # This method takes care of everything needed for automatic image extraction:
    # 1. Defines a `has_many` association from the imageable model to the image model.
    # 2. Registers a `before_validation` callback that automatically extracts images
    #    from the specified field.
    def setup_image_extraction(imageable_class, field, association_name)
      define_association(imageable_class, association_name, field)
      image_service_class = self

      imageable_class.before_validation do
        next unless will_save_change_to_attribute?(field)

        image_service_class.new.swap_data_images!(self, field, association_name)
      end
    end

    private

    def define_association(imageable_class, association_name, _field)
      imageable_class.has_many(
        association_name,
        as: :imageable,
        dependent: :destroy,
        class_name: content_image_class.name
      )
    end
  end
end
