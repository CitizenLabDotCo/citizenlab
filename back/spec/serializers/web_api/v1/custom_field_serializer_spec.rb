# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::CustomFieldSerializer do
  context 'for user custom fields' do
    let(:field) { create(:custom_field, resource_type: 'User') }

    it "includes the attribute 'hidden'" do
      serialized_field = described_class.new(field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to include(:hidden)
    end
  end

  context 'for idea custom fields' do
    let(:field) { create(:custom_field, :for_custom_form, key: 'extra') }

    it "does not include the attribute 'hidden'" do
      serialized_field = described_class.new(field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).not_to include(:hidden)
    end

    it "includes the attribute 'enabled'" do
      serialized_field = described_class.new(field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to include(:enabled)
    end

    it 'includes the attributes of a field' do
      params = { params: { constraints: {}, supports_answer_visible_to: true } }
      serialized_field = described_class.new(field, params).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to match({
        code: nil,
        created_at: an_instance_of(ActiveSupport::TimeWithZone),
        description_multiloc: { 'en' => 'Which councils are you attending in our city?' },
        enabled: true,
        input_type: 'text',
        key: 'extra',
        ordering: 0,
        required: false,
        title_multiloc: { 'en' => 'Did you attend' },
        updated_at: an_instance_of(ActiveSupport::TimeWithZone),
        logic: {},
        constraints: {},
        answer_visible_to: 'admins'
      })
    end
  end

  it 'swaps data images' do
    field = create(:custom_field)
    expect_any_instance_of(TextImageService).to(
      receive(:render_data_images)
        .with(field, :description_multiloc)
        .and_return({ 'en' => 'Description with swapped images' })
    )

    serialized_field = described_class.new(field).serializable_hash
    description_multiloc = serialized_field.dig(:data, :attributes, :description_multiloc)
    expect(description_multiloc).to eq({ 'en' => 'Description with swapped images' })
  end

  context 'linear_scale field' do
    let(:field) { create(:custom_field_linear_scale, :for_custom_form, key: 'scale') }

    it 'includes maximum, minimum_label_multiloc, and maximum_label_multiloc' do
      serialized_field = described_class.new(field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to match({
        code: nil,
        created_at: an_instance_of(ActiveSupport::TimeWithZone),
        description_multiloc: { 'en' => 'Please indicate how strong you agree or disagree.' },
        enabled: true,
        input_type: 'linear_scale',
        key: 'scale',
        maximum: 5,
        maximum_label_multiloc: { 'en' => 'Strongly agree' },
        minimum_label_multiloc: { 'en' => 'Strongly disagree' },
        ordering: 0,
        required: false,
        title_multiloc: { 'en' => 'We need a swimming pool.' },
        updated_at: an_instance_of(ActiveSupport::TimeWithZone),
        logic: {},
        constraints: {}
      })
    end
  end

  context 'page field' do
    let(:field) do
      create(
        :custom_field_page,
        :for_custom_form,
        key: 'page_1',
        logic: { next_page_id: 'TEMP-ID-1' }
      )
    end

    it 'does not include the logic' do
      serialized_field = described_class.new(field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to match({
        code: nil,
        created_at: an_instance_of(ActiveSupport::TimeWithZone),
        description_multiloc: { 'en' => 'This is a survey on your cycling habits.' },
        enabled: true,
        input_type: 'page',
        key: 'page_1',
        ordering: 0,
        required: false,
        title_multiloc: { 'en' => 'Cycling survey' },
        updated_at: an_instance_of(ActiveSupport::TimeWithZone),
        logic: { 'next_page_id' => 'TEMP-ID-1' },
        constraints: {}
      })
    end
  end
end
