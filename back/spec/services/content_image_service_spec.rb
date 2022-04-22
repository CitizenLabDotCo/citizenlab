require 'rails_helper'

describe ContentImageService do
  before do
    @text_image_1, @text_image_2, @text_image_3 = create_list :text_image, 3
    allow(TextImage).to receive(:create!).and_return(@text_image_1, @text_image_2, @text_image_3)
  end

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
    end
  end
  let(:service) { subclass.new }

  describe 'swap_data_images' do
    it 'returns exactly the same input locales' do
      imageable = build(:user, bio_multiloc: { 'en' => '[]', 'fr-BE' => '[]', 'nl-BE' => '[]', 'de' => '[]' })
      expect(TextImage).not_to receive :create!
      output = service.swap_data_images imageable, :bio_multiloc
      expect(output.keys).to match_array %w[en fr-BE nl-BE de]
    end

    it 'returns the same multiloc when no images are included' do
      json_str = '[{"type":"furniture"},{"type":"text","value":"My awesome text"}]'
      imageable = build(:user, bio_multiloc: { 'en' => json_str })
      expect(TextImage).not_to receive :create!
      output = service.swap_data_images imageable, :bio_multiloc
      expect(output).to eq({ 'en' => json_str })
    end

    it 'removes src and creates images when image elements occur without code' do
      json_str = [
        { type: 'image', custom_attribute: 27, src: 'https://images.com/image1.png' },
        { type: 'image', src: 'https://images.com/image2.png' }
      ].to_json
      imageable = build(:user, bio_multiloc: { 'en' => json_str })
      expect(TextImage).to receive(:create!).twice
      output = service.swap_data_images imageable, :bio_multiloc
      expected_json = [
        { type: 'image', custom_attribute: 27, data_cl2_content_image_code: @text_image_1.text_reference },
        { type: 'image', data_cl2_content_image_code: @text_image_2.text_reference }
      ].to_json
      expect(output).to eq({ 'en' => expected_json })
    end

    it 'removes src and does not create images when image elements occur with code' do
      json_str = [
        { type: 'image', src: 'https://images.com/image.png', data_cl2_content_image_code: '1234' }
      ].to_json
      imageable = build(:user, bio_multiloc: { 'en' => json_str })
      expect(TextImage).not_to receive(:create!)
      output = service.swap_data_images imageable, :bio_multiloc
      expected_json = [
        { type: 'image', data_cl2_content_image_code: '1234' }
      ].to_json
      expect(output).to eq({ 'en' => expected_json })
    end

    it 'does not create images when there is no src' do
      json_str = '[{type:"image"}]'
      imageable = build(:user, bio_multiloc: { 'en' => json_str })
      expect(TextImage).not_to receive(:create!)
      output = service.swap_data_images imageable, :bio_multiloc
      expect(output).to eq({ 'en' => json_str })
    end

    it 'returns the same value when decoding failed' do
      invalid_json_str = '¯\_(ツ)_/¯'
      valid_json_str = [
        { type: 'image', src: 'https://images.com/image.png' }
      ].to_json
      imageable = build(:user, bio_multiloc: { 'en' => invalid_json_str, 'de' => valid_json_str })
      expect(TextImage).to receive(:create!).once
      expect(Sentry).to receive :capture_exception
      output = service.swap_data_images imageable, :bio_multiloc
      expected_json = [
        { type: 'image', data_cl2_content_image_code: @text_image_1.text_reference }
      ].to_json
      expect(output).to eq({ 'en' => invalid_json_str, 'de' => expected_json })
    end
  end

  describe 'render_data_images' do
    it 'returns exactly the same input locales' do
      imageable = build(:user, bio_multiloc: { 'en' => '[]', 'fr-BE' => '[]', 'nl-BE' => '[]', 'de' => '[]' })
      output = service.render_data_images imageable, :bio_multiloc
      expect(output.keys).to match_array %w[en fr-BE nl-BE de]
    end
  end
end
