# frozen_string_literal: true

require 'rails_helper'

describe TextImageService do
  let(:service) { described_class.new }

  describe 'swap_data_images' do
    before do
      stub_request(:any, 'res.cloudinary.com').to_return(
        body: png_image_as_base64('image10.jpg')
      )
    end

    it 'processes both base64 and URL as src' do
      input = <<~HTML
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
        <img src="data:image/jpeg;base64,/9j/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=" />
        <img src="https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_with_speech_bubbles.jpeg" />
      HTML
      imageable = create(:project, description_multiloc: { 'fr-BE' => input })
      output = service.swap_data_images imageable.description_multiloc, field: :description_multiloc, imageable: imageable
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
      imageable = create(:project, description_multiloc: { 'en' => input })
      expect(service.swap_data_images(imageable.description_multiloc, field: :description_multiloc, imageable: imageable)).to eq({ 'en' => input })
    end

    # It's more of a side effect; what really matters is that it doesn't fail when some
    # values are nil.
    it 'converts nil values in multiloc to empty strings' do
      imageable = create(:project, description_multiloc: {
        'nl-BE' => nil,
        'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">'
      })

      output = service.swap_data_images imageable.description_multiloc, field: :description_multiloc, imageable: imageable
      text_image = imageable.text_images.reload.order(:created_at).first

      expect(output).to match(
        'en' => %(<img data-cl2-text-image-text-reference="#{text_image.text_reference}">),
        'nl-BE' => ''
      )
    end
  end

  describe 'swap_data_images!' do
    it 'extracts images and updates content field' do
      project = create(:project, description_multiloc: {
        'en' => html_with_base64_image,
        'fr-FR' => html_with_base64_image(alt_text: 'Point rouge')
      })

      service.swap_data_images!(project, :description_multiloc, :text_images)

      expect(project.text_images.size).to eq(2)
      project.description_multiloc.values.each do |value|
        expect(value).to include('data-cl2-text-image-text-reference')
        expect(value).not_to include('data:image/png;base64')
      end
    end

    it 'builds images through association with correct foreign keys' do
      project = create(:project, description_multiloc: { 'en' => html_with_base64_image })

      service.swap_data_images!(project, :description_multiloc, :text_images)

      text_image = project.text_images.sole
      expect(text_image.imageable_id).to eq(project.id)
    end

    it 'skips images that are already stored' do
      project = create(:project)
      text_image = create(:text_image, imageable: project)
      project.description_multiloc = {
        'en' => %(<img data-cl2-text-image-text-reference="#{text_image.text_reference}">)
      }

      expect do
        service.swap_data_images!(project, :description_multiloc, :text_images)
      end.not_to(change { TextImage.count })
    end
  end

  describe 'render_data_images_multiloc' do
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
      output = service.render_data_images_multiloc imageable.description_multiloc, field: :description_multiloc, imageable: imageable
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
        service.render_data_images_multiloc imageable.description_multiloc, field: :description_multiloc, imageable: imageable
      end.not_to exceed_query_limit(1).with(/SELECT.*text_images/)
    end
  end
end
