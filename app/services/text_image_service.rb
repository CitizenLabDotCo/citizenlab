class TextImageService

  def swap_data_images imageable, field
    multiloc = imageable.send(field)
    multiloc.each_with_object({}) do |(locale, text), output|
      output[locale] = swap_data_images_text(text) do |base64|
        generate_image_url(base64, imageable, field)
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
        image_url = yield(base64)
        img.set_attribute('src', image_url)
      end

    doc.to_s
  end


  private

  def generate_image_url base64, imageable, field
    text_image = TextImage.create!(
      imageable: imageable,
      imageable_field: field,
      image: base64
    )
    text_image.image.url
  end

end