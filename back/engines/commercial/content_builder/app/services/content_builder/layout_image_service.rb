module ContentBuilder
  class LayoutImageService
    def swap_data_images(imageable, field)
      multiloc = imageable.send field
      multiloc.each_with_object({}) do |(locale, encoded_content), output|
        content = decode_content encoded_content

        image_elements(content).each do |img_elt|
          if attribute? img_elt, image_attribute_for_element
            if !attribute? img_elt, code_attribute_for_element
              content_image = create_image! img_elt, imageable, field
              set_attribute! img_elt, code_attribute_for_element, content_image[code_attribute_for_model]
            end
            remove_attribute! img_elt, image_attribute_for_element
          end

          output[locale] = encode_content doc
        end
      end
    end

    def render_data_images(imageable, field)
      multiloc = imageable.send(field)

      if multiloc.values.any?{|text| text.include? 'data-code'}
        prefetched_text_images = imageable.text_images.map do |ti|
          [ti.text_reference, ti]
        end.to_h
        
        multiloc.each_with_object({}) do |(locale, text), output|
          doc = Nokogiri::HTML.fragment(text)
          if doc.errors.any?
            Sentry.capture_exception(
              Exception.new('Syntax error in HTML multiloc'),
              extra: {
                imageable_type: imageable.class,
                imageable_id: imageable.id,
                imageable_created_at: imageable.created_at,
                imageable_field: field,
                tenant_created_at: AppConfiguration.instance.created_at
              })
            return multiloc
          end

          doc.css("img")
            .select{|img| img.has_attribute?('data-code') }
            .each do |img|
              text_reference = img.attr('data-code')
              text_image = prefetched_text_images[text_reference]
              if text_image
                img.set_attribute('src', text_image.image.url)
              else
                Sentry.capture_exception(
                  Exception.new('No text image found with reference'),
                  extra: {
                    text_reference: text_reference,
                    imageable_type: imageable.class,
                    imageable_id: imageable.id,
                    imageable_created_at: imageable.created_at,
                    imageable_field: field,
                    tenant_created_at: AppConfiguration.instance.created_at
                  })
              end
            end

          output[locale] = encode_content doc
        end
      else
        multiloc
      end
    end

    protected

    def decode_content(json)
      json
    end

    def encode_content(json)
      json
    end

    def image_elements(content)
      content.select do |key, elt|
        key != 'ROOT' && elt.dig('type', 'resolvedName') == 'Image'
      end.values
    end

    def create_image!(img_elt, _, _)
      LayoutImage.create! remote_image_url: img_elt[image_attribute]
    end

    def attribute?(img_elt, image_attribute)
      img_elt.key? image_attribute
    end

    def set_attribute!(img_elt, attribute, value)
      img_elt[attribute] = value
    end

    def remove_attribute!(img_elt, attribute)
      img_elt.delete attribute
    end

    def code_attribute_for_element
      'data-code'
    end

    def image_attribute_for_element
      'src'
    end

    def code_attribute_for_model
      'code'
    end
  end
end
