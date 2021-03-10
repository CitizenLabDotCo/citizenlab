require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'User Custom Field Options' do
  explanation 'Options to choose from in a custom field.'

  before do
    header 'Content-Type', 'application/json'
    @custom_field = create(:custom_field_select)
    @custom_field_options = create_list(:custom_field_option, 3, custom_field: @custom_field)
  end

  context 'when authenticated as admin' do
    before do
      admin_header_token
    end

    delete 'web_api/v1/users/custom_fields/:custom_field_id/custom_field_options/:id' do
      let(:custom_field_option) { create(:custom_field_option, custom_field: @custom_field) }
      let(:id) { custom_field_option.id }

      example "[error] Delete a custom field option that's still referenced in a rules group" do
        group = create(:smart_group, rules: [
                         { ruleType: 'custom_field_select', customFieldId: @custom_field.id, predicate: 'has_value', value: id }
                       ])
        do_request
        expect(response_status).to eq 422
        expect(CustomFieldOption.find(id)).to be_present
      end
    end
  end
end
