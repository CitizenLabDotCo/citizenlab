# frozen_string_literal: true

class TextImageService < ContentImageService
  BASE64_REGEX = %r{^data:image/([a-zA-Z]*);base64,.*$}

  # Applies {#extract_data_images} to each multiloc value in the given multiloc.
  def extract_data_images_multiloc(multiloc)
    content_multiloc = {}
    extracted_images = []

    (multiloc || {}).each do |language_key, encoded_content|
      output = extract_data_images(encoded_content)

      content_multiloc[language_key] = output[:content]
      extracted_images += output[:extracted_images]
    end

    {
      content_multiloc: content_multiloc,
      extracted_images: extracted_images
    }
  end

  # Extracts and remove image data from the content, and stores it in an array
  # to be processed later.
  # Already updates the original content to reference the future image model instead.
  def extract_data_images(encoded_content)
    content = decode_content(encoded_content)

    extracted_images = []

    if !content
      return { content: encoded_content, extracted_images: extracted_images }
    end

    image_elements(content).each do |img_elt|
      next if image_attributes_for_element.none? { |elt_atr| attribute? img_elt, elt_atr }

      if !attribute?(img_elt, code_attribute_for_element)
        text_reference = SecureRandom.uuid
        set_attribute! img_elt, code_attribute_for_element, text_reference

        img_src = get_attribute img_elt, image_attribute_for_element
        img_key = img_src.match?(BASE64_REGEX) ? :image : :remote_image_url

        extracted_images << {
          text_reference: text_reference,
          img_key: img_key,
          img_src: img_src
        }
      end
      image_attributes_for_element.each do |elt_atr|
        remove_attribute! img_elt, elt_atr
      end
    end

    {
      content: encode_content(content),
      extracted_images: extracted_images
    }
  end

  def bulk_create_images!(
    extracted_images,
    imageable,
    field
  )
    extracted_images.map do |extracted_image|
      img_attrs = {
        imageable: imageable,
        imageable_field: field,
        text_reference: extracted_image[:text_reference]
      }
      img_attrs[extracted_image[:img_key]] = extracted_image[:img_src]

      TextImage.create!(img_attrs)
    end
  end

  protected

  def decode_content!(content)
    case content
    when Hash then content.transform_values { |v| decode_content!(v) }
    when String, nil then decode_string!(content)
    else raise ArgumentError, "Invalid content type: #{content.class}"
    end
  end

  def encode_content(content)
    case content
    when Nokogiri::HTML::DocumentFragment then content.to_s
    when Hash then content.transform_values(&:to_s)
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
  # @param html_doc [Nokogiri::HTML::DocumentFragment] the HTML document to search.
  # @return [Nokogiri::XML::NodeSet] the image elements.
  def image_elements(content)
    case content
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
