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
        answer_visible_to: 'admins',
        random_option_ordering: false
      })
    end
  end

  it 'swaps data images' do
    field = create(:custom_field)
    expect_any_instance_of(TextImageService).to(
      receive(:render_data_images_multiloc)
        .with(field.description_multiloc, field: :description_multiloc, imageable: field)
        .and_return({ 'en' => 'Description with swapped images' })
    )

    serialized_field = described_class.new(field).serializable_hash
    description_multiloc = serialized_field.dig(:data, :attributes, :description_multiloc)
    expect(description_multiloc).to eq({ 'en' => 'Description with swapped images' })
  end

  context 'linear_scale field' do
    let(:field) { create(:custom_field_linear_scale, :for_custom_form, key: 'scale') }

    it 'includes maximum and scale value labels' do
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
        linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
        linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
        linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
        linear_scale_label_4_multiloc: { 'en' => 'Agree' },
        linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
        linear_scale_label_6_multiloc: {},
        linear_scale_label_7_multiloc: {},
        linear_scale_label_8_multiloc: {},
        linear_scale_label_9_multiloc: {},
        linear_scale_label_10_multiloc: {},
        linear_scale_label_11_multiloc: {},
        ordering: 0,
        required: false,
        title_multiloc: { 'en' => 'We need a swimming pool.' },
        updated_at: an_instance_of(ActiveSupport::TimeWithZone),
        logic: {},
        constraints: {},
        random_option_ordering: false
      })
    end
  end

  context 'sentiment_linear_scale field' do
    let(:field) { create(:custom_field_sentiment_linear_scale, :for_custom_form, key: 'scale') }

    it 'includes maximum and scale value labels' do
      serialized_field = described_class.new(field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to match({
        code: nil,
        created_at: an_instance_of(ActiveSupport::TimeWithZone),
        description_multiloc: { 'en' => 'Please indicate how strong you agree or disagree.' },
        enabled: true,
        input_type: 'sentiment_linear_scale',
        key: 'scale',
        maximum: 5,
        ask_follow_up: false,
        linear_scale_label_1_multiloc: { 'en' => 'Strongly disagree' },
        linear_scale_label_2_multiloc: { 'en' => 'Disagree' },
        linear_scale_label_3_multiloc: { 'en' => 'Neutral' },
        linear_scale_label_4_multiloc: { 'en' => 'Agree' },
        linear_scale_label_5_multiloc: { 'en' => 'Strongly agree' },
        linear_scale_label_6_multiloc: {},
        linear_scale_label_7_multiloc: {},
        linear_scale_label_8_multiloc: {},
        linear_scale_label_9_multiloc: {},
        linear_scale_label_10_multiloc: {},
        linear_scale_label_11_multiloc: {},
        ordering: 0,
        required: false,
        title_multiloc: { 'en' => 'We need a swimming pool.' },
        updated_at: an_instance_of(ActiveSupport::TimeWithZone),
        logic: {},
        constraints: {},
        random_option_ordering: false
      })
    end
  end

  context 'rating field' do
    let(:field) { create(:custom_field_rating, :for_custom_form, key: 'scale') }

    it 'includes maximum value' do
      serialized_field = described_class.new(field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to match({
        code: nil,
        created_at: an_instance_of(ActiveSupport::TimeWithZone),
        description_multiloc: { 'en' => 'Please rate your experience from 1 (poor) to 5 (excellent).' },
        enabled: true,
        input_type: 'rating',
        key: 'scale',
        maximum: 5,
        ordering: 0,
        required: false,
        title_multiloc: { 'en' => 'How would you rate our service?' },
        updated_at: an_instance_of(ActiveSupport::TimeWithZone),
        logic: {},
        constraints: {},
        random_option_ordering: false
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
        page_layout: 'default',
        required: false,
        title_multiloc: { 'en' => 'Cycling survey' },
        updated_at: an_instance_of(ActiveSupport::TimeWithZone),
        logic: { 'next_page_id' => 'TEMP-ID-1' },
        constraints: {},
        random_option_ordering: false
      })
    end
  end

  context 'multiselect field' do
    let(:field) { create(:custom_field_multiselect, :for_custom_form, key: 'multiselect') }

    it 'includes the dropdown_layout attribute' do
      serialized_field = described_class.new(field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to match({
        code: nil,
        created_at: an_instance_of(ActiveSupport::TimeWithZone),
        description_multiloc: { 'en' => 'Which councils are you attending in our city?' },
        dropdown_layout: false,
        enabled: true,
        input_type: 'multiselect',
        maximum_select_count: nil,
        minimum_select_count: nil,
        key: 'multiselect',
        ordering: 0,
        required: false,
        select_count_enabled: false,
        title_multiloc: { 'en' => 'What languages do you speak?' },
        updated_at: an_instance_of(ActiveSupport::TimeWithZone),
        logic: {},
        constraints: {},
        random_option_ordering: false
      })
    end
  end

  context 'select_field' do
    let(:field) { create(:custom_field_select, :for_custom_form, key: 'select') }

    it 'includes the dropdown_layout attribute' do
      serialized_field = described_class.new(field).serializable_hash
      attributes = serialized_field[:data][:attributes]
      expect(attributes).to match({
        code: nil,
        created_at: an_instance_of(ActiveSupport::TimeWithZone),
        description_multiloc: { 'en' => 'Which councils are you attending in our city?' },
        dropdown_layout: false,
        enabled: true,
        input_type: 'select',
        key: 'select',
        ordering: 0,
        required: false,
        title_multiloc: { 'en' => 'Member of councils?' },
        updated_at: an_instance_of(ActiveSupport::TimeWithZone),
        logic: {},
        constraints: {},
        random_option_ordering: false
      })
    end
  end
end
