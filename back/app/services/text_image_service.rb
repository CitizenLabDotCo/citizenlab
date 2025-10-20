# frozen_string_literal: true

class TextImageService < ContentImageService
  BASE64_REGEX = %r{^data:image/([a-zA-Z]*);base64,.*$}

  # Applies {#extract_data_images} to each multiloc value in the given multiloc.
  def extract_data_images_multiloc(multiloc)
    multiloc.transform_values do |encoded_content|
      extract_data_images encoded_content
    end
  end

  # Extracts and remove image data from the content, and stores it in an array
  # to be processed later.
  # Already updates the original content to reference the future image model instead.
  def extract_data_images(encoded_content)
    content = begin
      decode_content encoded_content
    rescue DecodingError => e
      log_decoding_error e
    end

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

    return { 
      content: encode_content(content),
      extracted_images: extracted_images 
    }
  end

  def bulk_create_images_multiloc!(
    extract_data_images_multiloc_output,
    imageable,
    field
  )
    extract_data_images_multiloc_output.transform_values do |extract_data_images_output|
      bulk_create_images!(
        extract_data_images_output,
        imageable,
        field
      )
    end 
  end

  def bulk_create_images!(
    extract_data_images_output,
    imageable,
    field
  )
    extract_data_images_output[:extracted_images].map do |img_data|
      img_attrs = {
        imageable: imageable,
        imageable_field: field,
        text_reference: img_data[:text_reference]
      }
      img_attrs[img_data[:img_key]] = img_data[:img_src]

      TextImage.create!(img_attrs)
    end
  end

  protected

  # Decodes the given HTML string into a Nokogiri document.
  # @raise [DecodingError] if the HTML string is not valid.
  # @param html_string [String] the HTML string to decode.
  # @return [Nokogiri::HTML::DocumentFragment] the decoded HTML document.
  def decode_content(html_string)
    html_doc = Nokogiri::HTML.fragment html_string
    raise ContentImageService::DecodingError.new parse_errors: html_doc.errors if html_doc.errors.any?

    html_doc
  end

  # Encodes the given HTML document into a string.
  # @param [Nokogiri::HTML::DocumentFragment] html_doc the HTML document to encode.
  # @return [String] the encoded HTML string.
  def encode_content(html_doc)
    html_doc.to_s
  end

  # Returns the image elements in the given HTML document.
  # @param html_doc [Nokogiri::HTML::DocumentFragment] the HTML document to search.
  # @return [Nokogiri::XML::NodeSet] the image elements.
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

  def precompute_for_rendering(imageable)
    @precomputed_text_images = imageable.text_images.index_by do |ti|
      ti[code_attribute_for_model]
    end
  end

  def fetch_content_image(code)
    @precomputed_text_images[code] || content_image_class.find_by(code_attribute_for_model => code)
  end
end
