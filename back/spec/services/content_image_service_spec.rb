# frozen_string_literal: true

require 'rails_helper'

describe ContentImageService do
  before { allow(Sentry).to receive(:capture_exception).and_return(nil) }

  let(:subclass) do
    Class.new(described_class) do
      def decode_content(str)
        JSON.parse str, symbolize_names: true
      rescue StandardError => e
        raise ContentImageService::DecodingError.new parse_errors: e.message
      end

      def encode_content(json)
        json.to_json
      end

      def image_elements(content)
        content.select { |elt| elt[:type] == 'image' }
      end

      def content_image_class
        TextImage
      end

      def image_attributes(img_elt, imageable, field)
        { imageable: imageable, imageable_field: field, remote_image_url: img_elt[image_attribute_for_element] }
      end

      def code_attribute_for_element
        :data_cl2_content_image_code
      end

      def image_attribute_for_element
        :src
      end

      def code_attribute_for_model
        :text_reference
      end

      def precompute_for_rendering(_multiloc, _imageable, _field)
        @precomputed_content_images = content_image_class.all.index_by do |ti|
          ti[code_attribute_for_model]
        end
      end

      def fetch_content_image(code)
        @precomputed_content_images[code]
      end

      def content_image_url(content_image)
        "/images/#{content_image[code_attribute_for_model]}.jpg"
      end
    end
  end
  let(:service) { subclass.new }
  let(:text_images) { create_list :text_image, 2 }

  describe 'swap_data_images' do
    before { allow(TextImage).to receive(:create!).and_return(text_images[0], text_images[1]) }

    it 'returns exactly the same input locales' do
      imageable = build(:user, bio_multiloc: { 'en' => '[]', 'fr-BE' => '[]', 'nl-BE' => '[]', 'de' => '[]' })
      output = service.swap_data_images imageable, :bio_multiloc
      expect(output.keys).to match_array %w[en fr-BE nl-BE de]
    end

    it 'returns the same multiloc when no images are included' do
      json_str = '[{"type":"furniture"},{"type":"text","value":"My awesome text"}]'
      imageable = build(:user, bio_multiloc: { 'fr-BE' => json_str })
      output = service.swap_data_images imageable, :bio_multiloc
      expect(output).to eq({ 'fr-BE' => json_str })
    end

    it 'removes src and creates images when image elements occur without code' do
      json_str = [
        { type: 'image', custom_attribute: 27, src: 'https://images.com/image1.png' },
        { type: 'image', src: 'https://images.com/image2.png' }
      ].to_json
      expected_json = [
        { type: 'image', custom_attribute: 27, data_cl2_content_image_code: text_images[0].text_reference },
        { type: 'image', data_cl2_content_image_code: text_images[1].text_reference }
      ].to_json

      imageable = build(:user, bio_multiloc: { 'nl-BE' => json_str })
      output = service.swap_data_images imageable, :bio_multiloc
      expect(output).to eq({ 'nl-BE' => expected_json })
      expect(TextImage).to have_received(:create!).twice
    end

    it 'removes src and does not create images when image elements occur with code' do
      json_str = [
        { type: 'image', src: 'https://images.com/image.png', data_cl2_content_image_code: '1234' }
      ].to_json
      expected_json = [
        { type: 'image', data_cl2_content_image_code: '1234' }
      ].to_json

      imageable = build(:user, bio_multiloc: { 'en' => json_str })
      output = nil
      expect { output = service.swap_data_images imageable, :bio_multiloc }.not_to(change(TextImage, :count))
      expect(output).to eq({ 'en' => expected_json })
    end

    it 'does not create images when there is no src' do
      json_str = '[{"type":"image"}]'
      imageable = build(:user, bio_multiloc: { 'de' => json_str })
      output = nil
      expect { output = service.swap_data_images imageable, :bio_multiloc }.not_to(change(TextImage, :count))
      expect(output).to eq({ 'de' => json_str })
    end

    it 'returns the same value when decoding failed' do
      invalid_json_str = '¯\_(ツ)_/¯'
      valid_json_str = [
        { type: 'image', src: 'https://images.com/image.png' }
      ].to_json
      expected_json = [
        { type: 'image', data_cl2_content_image_code: text_images[0].text_reference }
      ].to_json

      imageable = build(:user, bio_multiloc: { 'en' => invalid_json_str, 'de' => valid_json_str })
      output = service.swap_data_images imageable, :bio_multiloc
      expect(output).to eq({ 'en' => invalid_json_str, 'de' => expected_json })
      expect(Sentry).to have_received :capture_exception
      expect(TextImage).to have_received(:create!).once
    end
  end

  describe 'render_data_images' do
    it 'returns exactly the same input locales' do
      imageable = build(:user, bio_multiloc: { 'en' => '[]', 'fr-BE' => '[]', 'nl-BE' => '[]', 'de' => '[]' })
      output = service.render_data_images imageable, :bio_multiloc
      expect(output.keys).to match_array %w[en fr-BE nl-BE de]
    end

    it 'can use precompute_for_rendering to fetch content images without running queries' do
      json_str = [
        { type: 'image', custom_attribute: 27, data_cl2_content_image_code: text_images[0].text_reference },
        { type: 'image', data_cl2_content_image_code: text_images[1].text_reference }
      ].to_json
      imageable = build(:user, bio_multiloc: { 'fr-BE' => json_str })
      expect do
        service.render_data_images imageable, :bio_multiloc
      end.not_to exceed_query_limit(1).with(/SELECT.*text_images/)
    end

    it 'adds the src attribute when the content includes images' do
      json_str = [
        { type: 'image', custom_attribute: 27, data_cl2_content_image_code: text_images[0].text_reference },
        { type: 'furniture' },
        { type: 'image', data_cl2_content_image_code: text_images[1].text_reference }
      ].to_json
      expected_json = [
        {
          type: 'image',
          custom_attribute: 27,
          data_cl2_content_image_code: text_images[0].text_reference,
          src: "/images/#{text_images[0].text_reference}.jpg"
        },
        {
          type: 'furniture'
        },
        {
          type: 'image',
          data_cl2_content_image_code: text_images[1].text_reference,
          src: "/images/#{text_images[1].text_reference}.jpg"
        }
      ].to_json

      imageable = build(:user, bio_multiloc: { 'nl-BE' => json_str })
      output = service.render_data_images imageable, :bio_multiloc
      expect(output).to eq({ 'nl-BE' => expected_json })
    end

    it 'returns the same multiloc when no images are included' do
      json_str = '[{"type":"furniture"},{"type":"text","value":"My awesome text"}]'
      imageable = build(:user, bio_multiloc: { 'en' => json_str })
      output = service.render_data_images imageable, :bio_multiloc
      expect(output).to eq({ 'en' => json_str })
    end

    it 'renders other images when an image could not be fetched' do
      json_str = [
        { type: 'image', data_cl2_content_image_code: 'nonexisting_code' },
        { type: 'image', data_cl2_content_image_code: text_images[1].text_reference }
      ].to_json
      expected_json = [
        {
          type: 'image',
          data_cl2_content_image_code: 'nonexisting_code'
        },
        {
          type: 'image',
          data_cl2_content_image_code: text_images[1].text_reference,
          src: "/images/#{text_images[1].text_reference}.jpg"
        }
      ].to_json

      imageable = build(:user, bio_multiloc: { 'de' => json_str })
      output = service.render_data_images imageable, :bio_multiloc
      expect(output).to eq({ 'de' => expected_json })
      expect(Sentry).to have_received :capture_exception
    end

    it 'skips image processing and returns the same value when could_include_images? returns false' do
      json_str = "[{\"type\":\"image\",\"data_cl2_content_image_code\":\"#{text_images[0].text_reference}\"}]"
      imageable = build(:user, bio_multiloc: { 'en' => json_str })
      allow(service).to receive(:could_include_images?).and_return(false)
      output = service.render_data_images imageable, :bio_multiloc
      expect(output).to eq({ 'en' => json_str })
      expect(service).to have_received :could_include_images?
    end
  end
end
