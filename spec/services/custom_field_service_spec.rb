require "rails_helper"

describe CustomFieldService do
  let(:service) { CustomFieldService.new }
  let(:metaschema) { JSON::Validator.validator_for_name("draft4").metaschema }
  let(:locale) { "en" }

  describe "fields_to_json_schema" do

    it "creates the valid empty schema on empty fields" do
      schema = service.fields_to_json_schema([], locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema).to match({
        type: "object",
        properties: {},
        :additionalProperties => false,
      })
    end

    it "creates a valid schema with all input types" do
      fields = [
        create(:custom_field, key: 'field1', input_type: 'text', ordering: 1),
        create(:custom_field, key: 'field2', input_type: 'multiline_text', ordering: 2, required: true),
        create(:custom_field, key: 'field3', input_type: 'select', ordering: 3),
        create(:custom_field, key: 'field4', input_type: 'multiselect', ordering: 4),
        create(:custom_field, key: 'field5', input_type: 'checkbox', ordering: nil),
        create(:custom_field, key: 'field6', input_type: 'date', ordering: 6)
      ]
      create(:custom_field_option, key: 'option1', ordering: '2', custom_field: fields[2])
      create(:custom_field_option, key: 'option2', ordering: '1', custom_field: fields[2])
      create(:custom_field_option, key: 'option3', ordering: '2', custom_field: fields[3])
      create(:custom_field_option, key: 'option4', ordering: '1', custom_field: fields[3])

      schema = service.fields_to_json_schema(fields, locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema).to match(        
        {:type=>"object",
         :additionalProperties=>false,
         :properties=>
          {"field1"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"string"},
           "field2"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"string"},
           "field3"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"string",
             :enum=>["option1", "option2"],
             :enumNames=>["youth council", "youth council"]},
           "field4"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"array",
             :uniqueItems=>true,
             :items=>
              {:type=>"string",
               :enum=>["option3", "option4"],
               :enumNames=>["youth council", "youth council"]},
             :minItems=>0},
           "field5"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"boolean"},
           "field6"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"string",
             :format=>"date"}},
         :required=>["field2"]}
      )
    end
  end

  describe "fields_to_ui_schema" do
    it "creates a valid ui schema with all input types" do
      fields = [
        create(:custom_field, key: 'field1', input_type: 'text', ordering: 1),
        create(:custom_field, key: 'field2', input_type: 'multiline_text', ordering: 2, required: true),
        create(:custom_field, key: 'field3', input_type: 'select', ordering: 3),
        create(:custom_field, key: 'field4', input_type: 'multiselect', ordering: nil),
        create(:custom_field, key: 'field5', input_type: 'checkbox', ordering: 6),
        create(:custom_field, key: 'field6', input_type: 'date', ordering: 5)
      ]
      create(:custom_field_option, key: 'option1', ordering: '2', custom_field: fields[2])
      create(:custom_field_option, key: 'option2', ordering: '1', custom_field: fields[2])
      create(:custom_field_option, key: 'option3', ordering: '2', custom_field: fields[3])
      create(:custom_field_option, key: 'option4', ordering: '1', custom_field: fields[3])

      schema = service.fields_to_ui_schema(fields, locale)
      expect(schema).to match(
        {"field1"=>{},
         "field2"=>{:"ui:widget"=>"textarea"},
         "field3"=>{},
         "field4"=>{},
         "field5"=>{},
         "field6"=>{},
         "ui:order"=>
          ["field1", "field2", "field3", "field6", "field5", "field4"]}
      )
    end
  end

end
