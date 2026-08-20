# frozen_string_literal: true

require 'rails_helper'

describe CustomFieldValuesValidationService do
  let(:service) { described_class.new }

  describe 'json_schema_validation_errors' do
    let_it_be(:text_field) { create(:custom_field, key: 'text_field', input_type: 'text') }
    let_it_be(:multiline_field) { create(:custom_field, key: 'multiline_field', input_type: 'multiline_text') }
    let_it_be(:select_field) do
      create(:custom_field_select, key: 'select_field').tap do |field|
        create(:custom_field_option, custom_field: field, key: 'option1')
        create(:custom_field_option, custom_field: field, key: 'option2')
      end
    end
    let_it_be(:select_with_other_field) do
      create(:custom_field_select, key: 'select_with_other_field').tap do |field|
        create(:custom_field_option, custom_field: field, key: 'other', other: true)
      end
    end
    let_it_be(:multiselect_field) { create(:custom_field_multiselect, :with_options, key: 'multiselect_field') }
    let_it_be(:checkbox_field) { create(:custom_field_checkbox, key: 'checkbox_field') }
    let_it_be(:date_field) { create(:custom_field_date, key: 'date_field') }
    let_it_be(:number_field) { create(:custom_field_number, key: 'number_field') }
    let_it_be(:point_field) { create(:custom_field_point, key: 'point_field') }
    let_it_be(:sentiment_field) { create(:custom_field_sentiment_linear_scale, key: 'sentiment_field', ask_follow_up: true) }
    let_it_be(:birthyear_field) { create(:custom_field, key: 'birthyear', code: 'birthyear', input_type: 'number') }
    let_it_be(:domicile_field) { create(:custom_field_domicile) }
    let_it_be(:areas) { create_list(:area, 2) }

    it 'returns no errors for empty values' do
      expect(service.json_schema_validation_errors([], {})).to be_empty
    end

    it 'returns no errors when the values match the field schemas' do
      fields = [text_field, multiline_field, select_field, multiselect_field, checkbox_field, date_field, number_field]
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
      errors = service.json_schema_validation_errors([number_field], { 'number_field' => 'forty-two' })
      expect(errors.size).to eq 1
      expect(errors.first[:fragment]).to eq '#/number_field'
    end

    it 'returns an error when the value is not one of the options' do
      errors = service.json_schema_validation_errors([select_field], { 'select_field' => 'unlisted_option' })
      expect(errors.size).to eq 1
      expect(errors.first[:fragment]).to eq '#/select_field'
    end

    it 'returns an error when a single option is passed for a multiselect field' do
      errors = service.json_schema_validation_errors([multiselect_field], { 'multiselect_field' => 'option1' })
      expect(errors.size).to eq 1
      expect(errors.first[:fragment]).to eq '#/multiselect_field'
    end

    it 'accepts any value for input types without a specific schema' do
      values = { 'point_field' => { 'type' => 'Point', 'coordinates' => [4.35, 50.85] } }
      expect(service.json_schema_validation_errors([point_field], values)).to be_empty
    end

    it 'accepts text under the companion key of a field with an other option' do
      values = { 'select_with_other_field' => 'other', 'select_with_other_field_other' => 'Something else' }
      expect(service.json_schema_validation_errors([select_with_other_field], values)).to be_empty
    end

    it 'accepts text under the companion key of a field with a follow-up question' do
      values = { 'sentiment_field' => 3, 'sentiment_field_follow_up' => 'Because we need it.' }
      expect(service.json_schema_validation_errors([sentiment_field], values)).to be_empty
    end

    it 'only accepts plausible years for the birthyear field' do
      expect(service.json_schema_validation_errors([birthyear_field], { 'birthyear' => 1987 })).to be_empty
      expect(service.json_schema_validation_errors([birthyear_field], { 'birthyear' => 1850 })).not_to be_empty
    end

    it 'accepts area ids and "outside" for the domicile field' do
      expect(service.json_schema_validation_errors([domicile_field], { 'domicile' => areas.first.id })).to be_empty
      expect(service.json_schema_validation_errors([domicile_field], { 'domicile' => 'outside' })).to be_empty
      expect(service.json_schema_validation_errors([domicile_field], { 'domicile' => 'elsewhere' })).not_to be_empty
    end
  end
end
