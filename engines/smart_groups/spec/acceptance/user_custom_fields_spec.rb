require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'User Custom Fields' do
  explanation 'Fields in forms (e.g. registration) which are customized by the city.'

  before do
    header 'Content-Type', 'application/json'
    @custom_fields = create_list(:custom_field, 3)
  end

  context 'when authenticated as admin' do
    before do
      admin_header_token
    end

    delete 'web_api/v1/users/custom_fields/:id' do
      let(:custom_field) { create(:custom_field) }
      let(:id) { custom_field.id }

      example_request 'Delete a custom field' do
        expect(response_status).to eq 200
        expect { CustomField.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      example "[error] Delete a custom field that's still referenced in a rules group" do
        group = create(:smart_group, rules: [
                         { ruleType: 'custom_field_text', customFieldId: id, predicate: 'is_empty' }
                       ])
        do_request
        expect(response_status).to eq 422
        expect(CustomField.find(id)).to be_present
      end
    end
  end
end
