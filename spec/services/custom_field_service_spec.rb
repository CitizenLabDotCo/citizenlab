require "rails_helper"

describe CustomFieldService do
  let(:service) { CustomFieldService.new }
  let(:metaschema) { JSON::Validator.validator_for_name("draft4").metaschema }
  let(:locale) { "en" }

  describe "fields_to_json_schema_multiloc" do

    let (:title_multiloc) {{'en' => 'size', 'nl-NL' => 'grootte'}}
    let (:description_multiloc) {{'en' => 'How big is it?', 'nl-NL' => 'Hoe groot is het?'}}
    let(:fields) {[
      create(:custom_field, 
        key: 'field1', 
        input_type: 'text', 
        title_multiloc: title_multiloc,
        description_multiloc: description_multiloc
      )
    ]}
    it "creates localized schemas with titles and descriptions for all languages" do
      schema = service.fields_to_json_schema_multiloc(AppConfiguration.instance, fields)
      expect(schema['en'][:properties]['field1'][:title]).to eq title_multiloc['en']
      expect(schema['nl-NL'][:properties]['field1'][:title]).to eq title_multiloc['nl-NL']
      expect(schema['en'][:properties]['field1'][:description]).to eq description_multiloc['en']
      expect(schema['nl-NL'][:properties]['field1'][:description]).to eq description_multiloc['nl-NL']
    end
  end

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

    it "creates the valid empty schema on a disabled field" do
      create(:custom_field, enabled: false)
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
        create(:custom_field, key: 'field1', input_type: 'text'),
        create(:custom_field, key: 'field2', input_type: 'multiline_text', required: true),
        create(:custom_field, key: 'field3', input_type: 'select'),
        create(:custom_field, key: 'field4', input_type: 'multiselect'),
        create(:custom_field, key: 'field5', input_type: 'checkbox'),
        create(:custom_field, key: 'field6', input_type: 'date', enabled: false, required: true),
        create(:custom_field, key: 'field7', input_type: 'number'),
        create(:custom_field, key: 'field8', input_type: 'multiselect', required: true),
        create(:custom_field, key: 'field9', input_type: 'files', required: true),
      ]
      create(:custom_field_option, key: 'option_1', custom_field: fields[2], ordering: 1) 
      create(:custom_field_option, key: 'option_3', custom_field: fields[2], ordering: 3) 
      create(:custom_field_option, key: 'option_2', custom_field: fields[2], ordering: 2)
      create(:custom_field_option, key: 'option_a', custom_field: fields[3], ordering: 1)
      create(:custom_field_option, key: 'option_b', custom_field: fields[3], ordering: 2)
      create(:custom_field_option, key: 'option_a', custom_field: fields[7], ordering: 1)
      create(:custom_field_option, key: 'option_b', custom_field: fields[7], ordering: 2)

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
             :enum=>["option_1", "option_2", "option_3"],
             :enumNames=>["youth council", "youth council", "youth council"]},
           "field4"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"array",
             :uniqueItems=>true,
             :items=>
              {:type=>"string",
               :enum=>["option_a", "option_b"],
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
             :format=>"date"},
            "field7"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"number"},
           "field8"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"array",
             :uniqueItems=>true,
             :items=>
              {:type=>"string",
               :enum=>["option_a", "option_b"],
               :enumNames=>["youth council", "youth council"]},
             :minItems=>1},
            "field9"=>
            {:title=>"Did you attend",
             :description=>"Which councils are you attending in our city?",
             :type=>"array",
             :items=>{
               :type=>"string",
               :format=>"data-url",
              }},
           },
         :required=>["field2","field8","field9"]}
      )
    end

    it "properly handles the custom behaviour of the birthyear field" do
      fields = [create(:custom_field, key: 'birthyear', code: 'birthyear', input_type: 'number')]
      schema = service.fields_to_json_schema(fields, locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'birthyear', :enum)&.size).to be > 100
    end

    it "properly handles the custom behaviour of the domicile field" do
      fields = [create(:custom_field, key: 'domicile', code: 'domicile')]
      create_list(:area, 5)
      schema = service.fields_to_json_schema(fields, locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'domicile', :enum)).to match (Area.all.order(created_at: :desc).map(&:id).push('outside'))
    end

    it "it creates a valid schema for the built in idea custom fields" do
      custom_form = create(:custom_form)
      fields = IdeaCustomFieldService.new.db_and_built_in_fields(custom_form)
      schema = service.fields_to_json_schema(fields, locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
    end
  end

  describe "fields_to_ui_schema" do
    it "creates a valid ui schema with all input types" do
      fields = [
        create(:custom_field, key: 'field1', input_type: 'text'),
        create(:custom_field, key: 'field2', input_type: 'multiline_text', required: true),
        create(:custom_field, key: 'field3', input_type: 'select'),
        create(:custom_field, key: 'field4', input_type: 'multiselect'),
        field5 = create(:custom_field, key: 'field5', input_type: 'checkbox'),
        field6 = create(:custom_field, key: 'field6', input_type: 'date'),
        create(:custom_field, key: 'field7', input_type: 'multiline_text', enabled: false, required: true),
        create(:custom_field, key: 'field8', input_type: 'text', hidden: true, enabled: true)
      ]
      field5.insert_at(3)
      field6.insert_at(3)
      create(:custom_field_option, key: 'option1', custom_field: fields[2])
      create(:custom_field_option, key: 'option2', custom_field: fields[2])
      create(:custom_field_option, key: 'option3', custom_field: fields[3])
      create(:custom_field_option, key: 'option4', custom_field: fields[3])

      schema = service.fields_to_ui_schema(fields.map(&:reload), locale)
      expect(schema).to match(
        {"field1"=>{},
         "field2"=>{:"ui:widget"=>"textarea"},
         "field3"=>{},
         "field4"=>{},
         "field5"=>{},
         "field6"=>{},
         "field7"=>{:"ui:widget"=>"hidden"},
         "field8"=>{:"ui:widget"=>"hidden"},
         "ui:order"=>
             %w[field1 field2 field3 field6 field5 field4 field7 field8]}
      )
    end
  end

  describe "keyify" do
    it "throws out non-valid chars" do
      str = (0..255).map{|i| i.chr('UTF-8').to_s}.join # keyify (parameterize call) does not work with ASCII strings
      expect(service.keyify(str)).to eq "0123456789_abcdefghijklmnopqrstuvwxyz___abcdefghijklmnopqrstuvwxyz_aaaaaaaeceeeeiiiidnoooooxouuuuythssaaaaaaaeceeeeiiiidnooooo_ouuuuythy"
    end
  end

end
