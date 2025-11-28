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

    # NOTE: We build the multiloc hash directly instead of passing it through the model
    # because Project's sanitize_description_multiloc callback converts nil to ''.
    # This test verifies that swap_data_images itself preserves nil values.
    it 'preserves nil values in multiloc' do
      imageable = create(:project)
      multiloc = {
        'nl-BE' => nil,
        'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">'
      }

      output = service.swap_data_images multiloc, field: :description_multiloc, imageable: imageable
      text_image = imageable.text_images.reload.order(:created_at).first

      expect(output).to match(
        'nl-BE' => nil,
        'en' => %(<img data-cl2-text-image-text-reference="#{text_image.text_reference}">)
      )
    end

    it 'processes valid locale and preserves malformed HTML' do
      # Nokogiri auto-fixes most HTML issues, so we need truly broken HTML
      malformed_html = '<<<<invalid>>>>'
      valid_html = '<p>Valid content</p>'
      multiloc = { 'en' => valid_html, 'fr' => malformed_html }

      result = service.swap_data_images(multiloc)

      expect(result).to match('en' => valid_html, 'fr' => malformed_html)
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
      project.description_multiloc.each_value do |value|
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
      end.not_to(change(TextImage, :count))
    end

    it 'skips processing for malformed HTML' do
      imageable = create(:project)
      malformed_html = '<<<<invalid>>>>'
      imageable.description_multiloc = { 'en' => malformed_html }

      # swap_data_images! returns the imageable, but doesn't modify the content
      original_content = imageable.description_multiloc['en']
      result = service.swap_data_images!(imageable, :description_multiloc, :text_images)

      expect(result).to eq(imageable) # Returns the imageable
      expect(imageable.description_multiloc['en']).to eq(original_content) # Content unchanged
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

  describe 'render_data_images' do
    it 'preserves nil in round-trip with swap_data_images' do
      imageable = create(:project)
      swapped = service.swap_data_images(nil, imageable: imageable, field: :description_multiloc)
      rendered = service.render_data_images(swapped, imageable: imageable, field: :description_multiloc)

      expect(rendered).to be_nil
    end
  end

  describe 'encode/decode content round-trip' do
    where(:description, :value) do
      [
        ['nil', nil],
        ['empty string', ''],
        ['simple HTML', '<p>Hello</p>'],
        ['HTML with image', '<img src="test.png">'],
        ['malformed HTML', '<<<<invalid>>>>'],
        ['flat hash', { 'en' => '<p>English</p>', 'fr' => '<p>French</p>' }],
        ['nested hash', { 'outer' => { 'inner' => '<p>Nested</p>' } }],
        ['hash with nil value', { 'en' => '<p>Content</p>', 'fr' => nil }],
        ['hash with empty string', { 'en' => '<p>Content</p>', 'fr' => '' }],
        ['hash with malformed HTML', { 'en' => '<p>Valid</p>', 'fr' => '<<<<bad>>>>' }]
      ]
    end

    with_them do
      it "preserves #{params[:description]} unchanged" do
        decoded = service.send(:decode_content, value)
        encoded = service.send(:encode_content, decoded)
        expect(encoded).to eq(value)
      end
    end
  end
end
