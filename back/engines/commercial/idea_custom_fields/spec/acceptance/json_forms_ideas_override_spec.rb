require 'rails_helper'

# The following specs are WIP and not implemented, and currently just serve as
# documentation for the expected behavior of the API output. It's not sure that
# this behavior should be implemented as a part of the JsonFormsService, it
# could also be done outside, so they're likely to turn into acceptance tests

describe 'JsonFormsService ideas overrides' do
  let(:service) { JsonFormsService.new }
  let(:metaschema) { JSON::Validator.validator_for_name('draft4').metaschema }
  let(:project) { create(:project) }
  let(:custom_form) { create(:custom_form, project: project) }
  let(:fields) { IdeaCustomFieldsService.new.all_fields(custom_form) }
  let(:user) { create(:user) }

  describe 'additional field' do
    before do
      cf2 = create(:custom_field, resource: custom_form, code: nil, key: 'field_1')
    end

    it 'only includes the topics associated with the current project' do
      schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, fields, user)[:json_schema_multiloc]['en']
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, :custom_field_values, :properties)).to match({ 'field_1' => { type: 'string' } })
    end
  end
end
