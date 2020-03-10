class TextImageService

  def swap_data_images imageable, field
    multiloc = imageable.send(field)
    multiloc.each_with_object({}) do |(locale, text), output|
      doc = Nokogiri::HTML.fragment(text)
      if doc.errors.any?
        Rails.logger.debug doc.errors
        return text
      end

      # TODO: remove src if img has attribute 'data-cl2-text-image-text-reference'?

      doc.css("img")
        .select{|img| img.has_attribute?('src') }
        .each do |img|
          img_src = img.attr('src')
          text_image = if img_src =~ /^data:image\/([a-zA-Z]*);base64,.*$/
            TextImage.create!(
              imageable: imageable,
              imageable_field: field,
              image: img_src
            )
          else
            TextImage.create!(
              imageable: imageable,
              imageable_field: field,
              remote_image_url: img_src
            )
          end
          img.set_attribute('data-cl2-text-image-text-reference', text_image.text_reference)
          img.remove_attribute('src')
        end

      output[locale] = doc.to_s
    end
  end

  def render_data_images imageable, field
    multiloc = imageable.send(field)
    multiloc.each_with_object({}) do |(locale, text), output|
      doc = Nokogiri::HTML.fragment(text)
      if doc.errors.any?
        Rails.logger.debug doc.errors
        return text
      end

      doc.css("img")
        .select{|img| !img.has_attribute?('src') }
        .each do |img|
          text_reference = img.attr('data-cl2-text-image-text-reference')
          text_image = TextImage.find_by text_reference: text_reference
          raise "Text image not found for #{imageable.class}[#{imageable.id}]->#{field}" if !text_image
          img.set_attribute('src', text_image.image.url)
        end

      output[locale] = doc.to_s
    end
  end
end