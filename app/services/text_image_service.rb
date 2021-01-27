class TextImageService

  def swap_data_images imageable, field
    multiloc = imageable.send(field)
    multiloc.each_with_object({}) do |(locale, text), output|
      doc = Nokogiri::HTML.fragment(text)
      if doc.errors.any?
        Rails.logger.debug doc.errors
        return multiloc
      end

      # When the frontend returns the rendered src attribute.
      doc.css("img")
        .select{|img| img.has_attribute?('src') && img.has_attribute?('data-cl2-text-image-text-reference') }
        .each do |img|
          img.remove_attribute('src')
        end

      # When the user inserted new images in the text.
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

    if multiloc.values.any?{|text| text.include? 'data-cl2-text-image-text-reference'}
      prefetched_text_images = imageable.text_images.map do |ti|
        [ti.text_reference, ti]
      end.to_h
      
      multiloc.each_with_object({}) do |(locale, text), output|
        doc = Nokogiri::HTML.fragment(text)
        if doc.errors.any?
          Raven.capture_exception(
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
          .select{|img| img.has_attribute?('data-cl2-text-image-text-reference') }
          .each do |img|
            text_reference = img.attr('data-cl2-text-image-text-reference')
            text_image = prefetched_text_images[text_reference]
            if text_image
              img.set_attribute('src', text_image.image.url)
            else
              Raven.capture_exception(
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

        output[locale] = doc.to_s
      end
    else
      multiloc
    end
  end
end