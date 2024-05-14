require 'rails_helper'

describe CustomFieldParamsService do
  let(:service) { described_class.new }
  let(:fields) do
    [
      create(:custom_field_multiselect, :with_options, key: 'multiselect_field'),
      create(:custom_field_text, key: 'text_field'),
      create(:custom_field_point, key: 'point_field'),
      create(:custom_field_file_upload, key: 'file_upload_field'),
      create(:custom_field_html_multiloc, key: 'html_multiloc_field'),
      create(:custom_field_linear_scale, key: 'linear_scale_field')
    ]
  end

  describe 'custom_field_values_params' do
    it 'returns flattened keys and keys with complex values' do
      output = service.custom_field_values_params fields
      expect(output).to eq [
        :text_field,
        :linear_scale_field,
        {
          multiselect_field: [],
          point_field: [:type, { coordinates: [] }],
          file_upload_field: %i[id content name],
          html_multiloc_field: CL2_SUPPORTED_LOCALES
        }
      ]
    end
  end
end
