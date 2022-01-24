require "rails_helper"

describe 'JsonFormsService user overrides' do
  let(:service) { JsonFormsService.new }
  let(:metaschema) { JSON::Validator.validator_for_name("draft4").metaschema }
  let(:locale) { "en" }

  describe "fields_to_json_schema" do

    it "properly handles the custom behaviour of the birthyear field" do
      fields = [create(:custom_field, key: 'birthyear', code: 'birthyear', input_type: 'number')]
      schema = service.fields_to_json_schema(fields, locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'birthyear', :oneOf)&.size).to be > 100
    end

    it "properly handles the custom behaviour of the domicile field" do
      fields = [create(:custom_field, key: 'domicile', code: 'domicile')]
      create_list(:area, 5)
      schema = service.fields_to_json_schema(fields, locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'domicile', :oneOf).map{|h| h[:const]}).to match (Area.all.order(created_at: :desc).map(&:id).push('outside'))
    end

  end

end
