require 'rails_helper'

describe CustomFieldParamsService do
  let(:service) { described_class.new }

  describe 'custom_field_values_params' do
    it 'returns bare keys for all scalar-valued input types' do
      types = %w[
        text multiline_text number checkbox date select select_image
        linear_scale rating sentiment_linear_scale point line polygon
      ]
      fields = types.map { |type| build(:custom_field, input_type: type, key: "#{type}_field") }
      expect(service.custom_field_values_params(fields)).to eq(types.map { |type| :"#{type}_field" })
    end

    it 'returns array declarations for multi-valued input types' do
      fields = %w[multiselect multiselect_image ranking].map do |type|
        build(:custom_field, input_type: type, key: "#{type}_field")
      end
      expect(service.custom_field_values_params(fields)).to eq([{
        multiselect_field: [],
        multiselect_image_field: [],
        ranking_field: []
      }])
    end

    it 'returns id, content and name keys for file input types' do
      fields = %w[file_upload shapefile_upload].map do |type|
        build(:custom_field, input_type: type, key: "#{type}_field")
      end
      expect(service.custom_field_values_params(fields)).to eq([{
        file_upload_field: %i[id content name],
        shapefile_upload_field: %i[id content name]
      }])
    end

    it 'returns the supported locales for multiloc input types' do
      fields = %w[text_multiloc multiline_text_multiloc html_multiloc].map do |type|
        build(:custom_field, input_type: type, key: "#{type}_field")
      end
      expect(service.custom_field_values_params(fields)).to eq([{
        text_multiloc_field: CL2_SUPPORTED_LOCALES,
        multiline_text_multiloc_field: CL2_SUPPORTED_LOCALES,
        html_multiloc_field: CL2_SUPPORTED_LOCALES
      }])
    end

    it 'returns the statement keys for matrix fields' do
      field = create(:custom_field_matrix_linear_scale, key: 'matrix_field')
      expect(service.custom_field_values_params([field])).to eq([{
        matrix_field: %i[send_more_animals_to_space ride_bicycles_more_often]
      }])
    end

    it 'returns flattened keys followed by one hash of keys with complex values' do
      fields = [
        build(:custom_field_multiselect, key: 'multiselect_field'),
        build(:custom_field_text, key: 'text_field'),
        build(:custom_field_point, key: 'point_field'),
        build(:custom_field_file_upload, key: 'file_upload_field'),
        build(:custom_field_html_multiloc, key: 'html_multiloc_field'),
        build(:custom_field_linear_scale, key: 'linear_scale_field')
      ]
      expect(service.custom_field_values_params(fields)).to eq [
        :text_field,
        :point_field,
        :linear_scale_field,
        {
          multiselect_field: [],
          file_upload_field: %i[id content name],
          html_multiloc_field: CL2_SUPPORTED_LOCALES
        }
      ]
    end
  end

  describe 'extract_custom_field_values_from_params!' do
    let(:select_field) do
      field = build(:custom_field_select, key: 'select_field')
      field.options = [
        build(:custom_field_option, key: 'option1', custom_field: field),
        build(:custom_field_option, key: 'other', other: true, custom_field: field)
      ]
      field
    end
    let(:multiselect_field) do
      field = build(:custom_field_multiselect, key: 'multiselect_field')
      field.options = [
        build(:custom_field_option, key: 'option1', custom_field: field),
        build(:custom_field_option, key: 'other', other: true, custom_field: field)
      ]
      field
    end
    let(:fields) do
      [
        build(:custom_field, code: 'title_multiloc', key: 'title_multiloc'),
        build(:custom_field_text, key: 'text_field'),
        build(:custom_field_text, key: 'disabled_field', enabled: false),
        build(:custom_field_checkbox, key: 'checkbox_field'),
        select_field,
        select_field.other_option_text_field,
        multiselect_field,
        multiselect_field.other_option_text_field
      ]
    end

    it 'extracts enabled extra field values and removes them from the params' do
      params = { 'text_field' => 'a value', 'unrelated' => 'stays' }
      result = service.extract_custom_field_values_from_params!(params, fields)
      expect(result).to eq('text_field' => 'a value')
      expect(params).to eq('unrelated' => 'stays')
    end

    it 'extracts false values' do
      params = { 'checkbox_field' => false }
      result = service.extract_custom_field_values_from_params!(params, fields)
      expect(result).to eq('checkbox_field' => false)
      expect(params).to eq({})
    end

    it 'leaves built-in field values in the params and out of the result' do
      params = { 'title_multiloc' => { 'en' => 'A title' }, 'text_field' => 'a value' }
      result = service.extract_custom_field_values_from_params!(params, fields)
      expect(result).to eq('text_field' => 'a value')
      expect(params).to eq('title_multiloc' => { 'en' => 'A title' })
    end

    it 'consumes values of disabled fields without extracting them' do
      params = { 'disabled_field' => 'a value' }
      result = service.extract_custom_field_values_from_params!(params, fields)
      expect(result).to eq({})
      expect(params).to eq({})
    end

    context "for 'other' text values" do
      it 'keeps the other text when the parent select value is other' do
        params = { 'select_field' => 'other', 'select_field_other' => 'Ferret' }
        result = service.extract_custom_field_values_from_params!(params, fields)
        expect(result).to eq('select_field' => 'other', 'select_field_other' => 'Ferret')
      end

      it 'keeps the other text when other is among the parent multiselect values' do
        params = { 'multiselect_field' => %w[option1 other], 'multiselect_field_other' => 'Ferret' }
        result = service.extract_custom_field_values_from_params!(params, fields)
        expect(result).to eq('multiselect_field' => %w[option1 other], 'multiselect_field_other' => 'Ferret')
      end

      it 'drops the other text when the parent has a non-other value' do
        params = { 'select_field' => 'option1', 'select_field_other' => 'Ferret' }
        result = service.extract_custom_field_values_from_params!(params, fields)
        expect(result).to eq('select_field' => 'option1')
      end

      it 'drops the other text when the parent value is missing' do
        params = { 'select_field_other' => 'Ferret' }
        result = service.extract_custom_field_values_from_params!(params, fields)
        expect(result).to eq({})
      end
    end
  end
end
