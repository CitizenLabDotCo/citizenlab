class TextImageService

  def swap_data_images imageable, field
    multiloc = imageable.send(field)
    multiloc.each_with_object({}) do |(locale, text), output|
      output[locale] = swap_data_images_text(text) do |image_data, image_type|
        generate_text_image image_data, image_type, imageable, field
      end
    end
  end

  def swap_data_images_text text
    doc = Nokogiri::HTML.fragment(text)
    if doc.errors.any?
      Rails.logger.debug doc.errors
      return text
    end

    doc.css("img")
      .select{|img| img.attr('src') =~ /^data:image\/([a-zA-Z]*);base64,.*$/}
      .each do |img|
        base64 = img.attr('src')
        text_image = yield(base64, :base64)
        img.set_attribute('src', text_image.image.url)
        img.set_attribute('data-cl2-text-image-text-reference', text_image.text_reference)
      end

    doc.css("img")
      .select do |img| 
        ( img.attr('src') =~ /^$|^((http:\/\/.+)|(https:\/\/.+))/ &&
          !img.attr('src').start_with?(Frontend::UrlService.new.home_url)
          )
      end
      .each do |img|
        old_url = img.attr('src')
        text_image = yield(old_url, :url)
        img.set_attribute('src', text_image.image.url)
        img.set_attribute('data-cl2-text-image-text-reference', text_image.text_reference)
      end

    doc.to_s
  end


  private

  def generate_text_image image_data, image_type, imageable, field
    text_image = case image_type
      when :base64
        TextImage.create!(
          imageable: imageable,
          imageable_field: field,
          image: image_data
        )
      when :url
        TextImage.create!(
          imageable: imageable,
          imageable_field: field,
          remote_image_url: image_data
        )
      end
    text_image.image.url
  end
end