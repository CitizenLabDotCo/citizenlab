# frozen_string_literal: true

require 'rails_helper'

describe TextImageService do
  let(:service) { described_class.new }

  describe 'swap_data_images' do
    before do
      stub_request(:any, 'res.cloudinary.com').to_return(
        body: png_image_as_base64('image10.png')
      )
    end

    it 'processes both base64 and URL as src' do
      input = <<~HTML
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
        <img src="data:image/jpeg;base64,/9j/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=" />
        <img src="https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_with_speech_bubbles.jpeg" />
      HTML
      imageable = build(:project, description_multiloc: { 'fr-BE' => input })
      output = service.swap_data_images imageable, :description_multiloc
      codes = imageable.reload.text_images.order(:created_at).pluck :text_reference
      expected_html = <<~HTML
        <img data-cl2-text-image-text-reference="#{codes[0]}">
        <img data-cl2-text-image-text-reference="#{codes[1]}">
        <img data-cl2-text-image-text-reference="#{codes[2]}">
      HTML
      expect(output).to eq({ 'fr-BE' => expected_html })
    end

    it 'does not modify the empty string' do
      input = ''
      imageable = build(:project, description_multiloc: { 'en' => input })
      expect(service.swap_data_images(imageable, :description_multiloc)).to eq({ 'en' => input })
    end
  end

  describe 'render_data_images' do
    it 'adds src attributes to the img tags' do
      text_image1, text_image2 = create_list(:text_image, 2)
      input = <<~HTML
        <img data-cl2-text-image-text-reference="#{text_image1.text_reference}">
        <div>no image here</div>
        <img data-cl2-text-image-text-reference="#{text_image2.text_reference}">
      HTML
      expected_html = <<~HTML
        <img data-cl2-text-image-text-reference="#{text_image1.text_reference}" src="#{text_image1.image.url}">
        <div>no image here</div>
        <img data-cl2-text-image-text-reference="#{text_image2.text_reference}" src="#{text_image2.image.url}">
      HTML

      imageable = build(:project, description_multiloc: { 'de' => input })
      output = service.render_data_images imageable, :description_multiloc
      expect(output).to eq({ 'de' => expected_html })
    end

    it 'gets all text images in one query' do
      imageable = create(:project)
      input = <<~HTML
        <img data-cl2-text-image-text-reference="#{create(:text_image, imageable: imageable).text_reference}">
        <img data-cl2-text-image-text-reference="#{create(:text_image, imageable: imageable).text_reference}">
        <img data-cl2-text-image-text-reference="#{create(:text_image, imageable: imageable).text_reference}">
      HTML
      imageable.update! description_multiloc: { 'nl-BE' => input }
      expect do
        service.render_data_images imageable, :description_multiloc
      end.not_to exceed_query_limit(1).with(/SELECT.*text_images/)
    end
  end
end
