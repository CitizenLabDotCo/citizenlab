# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BulkImportIdeas::Parsers::IdeaRowMapper do
  let(:project) { create(:single_phase_ideation_project) }
  let(:phase) { project.phases.first }
  let(:mapper) { described_class.new(phase: phase, project: project, locale: 'en', personal_data_enabled: false) }

  describe '#idea_blank?' do
    it 'returns true when all values are blank' do
      expect(mapper.idea_blank?({ 'a' => '', 'b' => nil })).to be true
    end

    it 'returns false when any value is present' do
      expect(mapper.idea_blank?({ 'a' => '', 'b' => 'something' })).to be false
    end
  end

  describe '#process_field_value' do
    let(:form_fields) do
      [
        { key: 'colour', name: 'Colour', type: 'field', input_type: 'select', parent_key: nil },
        { key: 'red', name: 'Red', type: 'option', input_type: 'option', parent_key: 'colour' },
        { key: 'blue', name: 'Blue', type: 'option', input_type: 'option', parent_key: 'colour' },
        { key: 'multi', name: 'Multi', type: 'field', input_type: 'multiselect', parent_key: nil },
        { key: 'opt_a', name: 'A', type: 'option', input_type: 'option', parent_key: 'multi' },
        { key: 'opt_b', name: 'B', type: 'option', input_type: 'option', parent_key: 'multi' }
      ]
    end

    it 'maps select values to option keys' do
      field = { key: 'colour', input_type: 'select', value: 'Red' }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to eq ['red']
    end

    it 'maps multiselect array values to option keys' do
      field = { key: 'multi', input_type: 'multiselect', value: %w[A B] }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to match_array %w[opt_a opt_b]
    end

    it 'converts number fields to integer' do
      field = { key: 'num', input_type: 'number', value: '42' }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to eq 42
    end

    it 'converts linear_scale fields to integer' do
      field = { key: 'scale', input_type: 'linear_scale', value: '3' }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to eq 3
    end

    it 'converts rating fields to integer' do
      field = { key: 'rate', input_type: 'rating', value: '4' }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to eq 4
    end

    it 'converts checkbox "X" to true' do
      field = { key: 'cb', input_type: 'checkbox', value: 'X' }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to be true
    end

    it 'converts checkbox "checked" to true' do
      field = { key: 'cb', input_type: 'checkbox', value: 'checked' }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to be true
    end

    it 'converts checkbox with other values to false' do
      field = { key: 'cb', input_type: 'checkbox', value: 'no' }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to be false
    end

    it 'formats date fields' do
      field = { key: 'dt', input_type: 'date', value: '15-08-2023' }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to eq '2023-08-15'
    end

    it 'yields to block for matrix_linear_scale fields' do
      field = { key: 'matrix', input_type: 'matrix_linear_scale', value: 'raw_input' }
      result = mapper.process_field_value(field, form_fields) { |_f| { 'statement_1' => 3 } }
      expect(result[:value]).to eq({ 'statement_1' => 3 })
    end

    it 'converts unknown types to string' do
      field = { key: 'other', input_type: 'text', value: 123 }
      result = mapper.process_field_value(field, form_fields) { |f| f[:value] }
      expect(result[:value]).to eq '123'
    end
  end

  describe '#process_user_details' do
    let(:fields_with_consent) do
      [
        { name: 'Permission', value: 'X' },
        { name: 'Email address', value: 'bill@example.com' },
        { name: 'First name(s)', value: 'Bill' },
        { name: 'Last name', value: 'Test' },
        { name: 'Other field', value: 'keep me' }
      ]
    end

    it 'extracts user details when permission is present' do
      idea_row = {}
      mapper.process_user_details(fields_with_consent, idea_row)

      expect(idea_row[:user_consent]).to be true
      expect(idea_row[:user_email]).to eq 'bill@example.com'
      expect(idea_row[:user_first_name]).to eq 'Bill'
      expect(idea_row[:user_last_name]).to eq 'Test'
    end

    it 'removes user fields from the fields array' do
      mapper.process_user_details(fields_with_consent, {})

      remaining_names = fields_with_consent.map { |f| f[:name] }
      expect(remaining_names).to eq ['Other field']
    end

    it 'does not extract user details when permission is blank' do
      fields = [
        { name: 'Permission', value: '' },
        { name: 'Email address', value: 'bill@example.com' },
        { name: 'First name(s)', value: 'Bill' },
        { name: 'Last name', value: 'Test' }
      ]
      idea_row = {}
      mapper.process_user_details(fields, idea_row)

      expect(idea_row[:user_consent]).to be false
      expect(idea_row).not_to have_key(:user_email)
      expect(idea_row).not_to have_key(:user_first_name)
      expect(idea_row).not_to have_key(:user_last_name)
    end

    it 'fixes malformed email addresses' do
      fields = [
        { name: 'Permission', value: 'X' },
        { name: 'Email address', value: 'bill@examplecom' }
      ]
      idea_row = {}
      mapper.process_user_details(fields, idea_row)

      expect(idea_row[:user_email]).to eq 'bill@example.com'
    end

    it 'sets email to nil for unfixable addresses' do
      fields = [
        { name: 'Permission', value: 'X' },
        { name: 'Email address', value: 'not an email' }
      ]
      idea_row = {}
      mapper.process_user_details(fields, idea_row)

      expect(idea_row[:user_email]).to be_nil
    end
  end

  describe '#process_custom_form_fields' do
    it 'maps custom fields by key' do
      merged_fields = [
        { key: 'text_field', code: nil, input_type: 'text', value: 'hello' },
        { key: 'number_field', code: nil, input_type: 'number', value: 5 }
      ]
      idea_row = {}
      mapper.process_custom_form_fields(merged_fields, idea_row)

      expect(idea_row[:custom_field_values]).to eq({ text_field: 'hello', number_field: 5 })
    end

    it 'maps core fields by code' do
      merged_fields = [
        { key: 'title_multiloc', code: 'title_multiloc', input_type: 'text_multiloc', value: 'A title' }
      ]
      idea_row = {}
      mapper.process_custom_form_fields(merged_fields, idea_row)

      expect(idea_row[:title_multiloc]).to eq({ en: 'A title' })
    end

    it 'unwraps single-element arrays for select fields' do
      merged_fields = [
        { key: 'colour', code: nil, input_type: 'select', value: ['red'] }
      ]
      idea_row = {}
      mapper.process_custom_form_fields(merged_fields, idea_row)

      expect(idea_row[:custom_field_values][:colour]).to eq 'red'
    end

    it 'skips fields with nil key or value' do
      merged_fields = [
        { key: nil, code: nil, input_type: 'text', value: 'skip me' },
        { key: 'present', code: nil, input_type: 'text', value: nil }
      ]
      idea_row = {}
      mapper.process_custom_form_fields(merged_fields, idea_row)

      expect(idea_row[:custom_field_values]).to eq({})
    end
  end

  describe '#format_date (private)' do
    it 'formats date strings in dd-mm-yyyy format' do
      expect(mapper.send(:format_date, '15-08-2023')).to eq '2023-08-15'
    end

    it 'formats date objects' do
      expect(mapper.send(:format_date, Date.new(2023, 8, 15))).to eq '2023-08-15'
    end

    it 'returns nil for invalid date strings' do
      expect(mapper.send(:format_date, 'A DATE')).to be_nil
    end
  end
end
