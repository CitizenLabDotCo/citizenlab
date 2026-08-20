# frozen_string_literal: true

require 'rails_helper'

describe CustomFieldValuesValidationService do
  let(:service) { described_class.new }

  describe 'json_schema_validation_errors' do
    it 'returns no errors for empty values' do
      expect(service.json_schema_validation_errors([], {})).to be_empty
    end

    it 'returns no errors when the values match the field schemas' do
      fields = [
        create(:custom_field, key: 'text_field', input_type: 'text'),
        create(:custom_field, key: 'multiline_field', input_type: 'multiline_text'),
        create(:custom_field_select, :with_options, key: 'select_field'),
        create(:custom_field_multiselect, :with_options, key: 'multiselect_field'),
        create(:custom_field_checkbox, key: 'checkbox_field'),
        create(:custom_field_date, key: 'date_field'),
        create(:custom_field_number, key: 'number_field')
      ]
      values = {
        'text_field' => 'some text',
        'multiline_field' => "some\nlines of text",
        'select_field' => 'option1',
        'multiselect_field' => %w[option1 option2],
        'checkbox_field' => true,
        'date_field' => '2026-08-20',
        'number_field' => 42
      }
      expect(service.json_schema_validation_errors(fields, values)).to be_empty
    end

    it 'returns an error for values of a field that does not exist' do
      errors = service.json_schema_validation_errors([], { 'unknown_field' => 'some value' })
      expect(errors.size).to eq 1
      expect(errors.first[:human_message]).to include 'unknown_field'
    end

    it 'returns an error when the value has the wrong type' do
      fields = [create(:custom_field_number, key: 'number_field')]
      errors = service.json_schema_validation_errors(fields, { 'number_field' => 'forty-two' })
      expect(errors.size).to eq 1
      expect(errors.first[:fragment]).to eq '#/number_field'
    end

    it 'returns an error when the value is not one of the options' do
      fields = [create(:custom_field_select, :with_options, key: 'select_field')]
      errors = service.json_schema_validation_errors(fields, { 'select_field' => 'unlisted_option' })
      expect(errors.size).to eq 1
      expect(errors.first[:fragment]).to eq '#/select_field'
    end

    it 'returns an error when a single option is passed for a multiselect field' do
      fields = [create(:custom_field_multiselect, :with_options, key: 'multiselect_field')]
      errors = service.json_schema_validation_errors(fields, { 'multiselect_field' => 'option1' })
      expect(errors.size).to eq 1
      expect(errors.first[:fragment]).to eq '#/multiselect_field'
    end

    it 'accepts any value for input types without a specific schema' do
      fields = [create(:custom_field_point, key: 'point_field')]
      values = { 'point_field' => { 'type' => 'Point', 'coordinates' => [4.35, 50.85] } }
      expect(service.json_schema_validation_errors(fields, values)).to be_empty
    end

    it 'accepts text under the companion key of a field with an other option' do
      field = create(:custom_field_select, key: 'select_field')
      create(:custom_field_option, key: 'other', other: true, custom_field: field)
      values = { 'select_field' => 'other', 'select_field_other' => 'Something else' }
      expect(service.json_schema_validation_errors([field], values)).to be_empty
    end

    it 'accepts text under the companion key of a field with a follow-up question' do
      fields = [create(:custom_field_sentiment_linear_scale, key: 'sentiment_field', ask_follow_up: true)]
      values = { 'sentiment_field' => 3, 'sentiment_field_follow_up' => 'Because we need it.' }
      expect(service.json_schema_validation_errors(fields, values)).to be_empty
    end

    it 'only accepts plausible years for the birthyear field' do
      fields = [create(:custom_field, key: 'birthyear', code: 'birthyear', input_type: 'number')]
      expect(service.json_schema_validation_errors(fields, { 'birthyear' => 1987 })).to be_empty
      expect(service.json_schema_validation_errors(fields, { 'birthyear' => 1850 })).not_to be_empty
    end

    it 'accepts area ids and "outside" for the domicile field' do
      fields = [create(:custom_field_domicile)]
      areas = create_list(:area, 2)
      expect(service.json_schema_validation_errors(fields, { 'domicile' => areas.first.id })).to be_empty
      expect(service.json_schema_validation_errors(fields, { 'domicile' => 'outside' })).to be_empty
      expect(service.json_schema_validation_errors(fields, { 'domicile' => 'elsewhere' })).not_to be_empty
    end
  end
end
