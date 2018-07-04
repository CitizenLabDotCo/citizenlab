class TextImageService

  def swap_data_images text
    doc = Nokogiri::HTML.fragment(text)
    if doc.errors.any?
      Rails.logger.debug doc.errors
      return text
    end

    doc.css("img")
      .select{|img| img.attr('src') =~ /^data:image\/([a-zA-Z]*);base64,.*$/}
      .each do |img|
        base64 = img.attr('src')
        text_image = generate_image_model(base64)
        new_href = text_image.image.url
        img.set_attribute('src', new_href)
      end

    doc.to_s
  end


  private

  def generate_image_model base64
    OpenStruct.new(image: OpenStruct.new(url: "https://some.url"))
  end


end