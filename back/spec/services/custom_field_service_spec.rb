# frozen_string_literal: true

require 'rails_helper'

describe CustomFieldService do
  let(:service) { described_class.new }
  let(:metaschema) { JSON::Validator.validator_for_name('draft4').metaschema }
  let(:locale) { 'en' }

  describe 'cleanup_custom_field_values!' do
    let(:field_values) { { 'key1' => nil, 'key2' => '', 'key3' => 'Not blank', 'key4' => true, 'key5' => false } }

    it 'destructively deletes keys with blank values from the argument and returns the argument' do
      cleaned_values = service.compact_custom_field_values! field_values
      expect(field_values).to eq({ 'key3' => 'Not blank', 'key4' => true, 'key5' => false })
      expect(cleaned_values).to be field_values
    end
  end

  describe 'fields_to_json_schema_multiloc' do
    let(:title_multiloc) { { 'en' => 'size', 'nl-NL' => 'grootte' } }
    let(:description_multiloc) { { 'en' => 'How big is it?', 'nl-NL' => 'Hoe groot is het?' } }
    let(:fields) do
      [
        create(:custom_field,
          key: 'field1',
          input_type: 'text',
          title_multiloc: title_multiloc,
          description_multiloc: description_multiloc)
      ]
    end

    it 'creates localized schemas with titles and descriptions for all languages' do
      schema = service.fields_to_json_schema_multiloc(AppConfiguration.instance, fields)
      expect(schema['en'][:properties]['field1'][:title]).to eq title_multiloc['en']
      expect(schema['nl-NL'][:properties]['field1'][:title]).to eq title_multiloc['nl-NL']
      expect(schema['en'][:properties]['field1'][:description]).to eq description_multiloc['en']
      expect(schema['nl-NL'][:properties]['field1'][:description]).to eq description_multiloc['nl-NL']
    end
  end

  describe 'fields_to_json_schema' do
    it 'creates the valid empty schema on empty fields' do
      schema = service.fields_to_json_schema([], locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema).to match({
        type: 'object',
        properties: {},
        additionalProperties: false
      })
    end

    it 'creates the valid empty schema on a disabled field' do
      create(:custom_field, enabled: false)
      schema = service.fields_to_json_schema([], locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema).to match({
        type: 'object',
        properties: {},
        additionalProperties: false
      })
    end

    it 'creates a valid schema with all input types' do
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
        create(:custom_field, key: 'field10', input_type: 'point')
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
        { type: 'object',
          additionalProperties: false,
          properties: { 'field1' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'string' },
                        'field2' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'string' },
                        'field3' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'string',
              enum: %w[option_1 option_2 option_3],
              enumNames: ['youth council', 'youth council', 'youth council'] },
                        'field4' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'array',
              uniqueItems: true,
              items: { type: 'string',
                       enum: %w[option_a option_b],
                       enumNames: ['youth council', 'youth council'] },
              minItems: 0 },
                        'field5' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'boolean' },
                        'field6' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'string',
              format: 'date' },
                        'field7' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'number' },
                        'field8' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'array',
              uniqueItems: true,
              items: { type: 'string',
                       enum: %w[option_a option_b],
                       enumNames: ['youth council', 'youth council'] },
              minItems: 1 },
                        'field9' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'array',
              items: {
                type: 'string',
                format: 'data-url'
              } },
                        'field10' =>
            { title: 'Did you attend',
              description: 'Which councils are you attending in our city?',
              type: 'string' } },
          required: %w[field2 field8 field9] }
      )
    end

    it 'properly handles the custom behaviour of the birthyear field' do
      fields = [create(:custom_field, key: 'birthyear', code: 'birthyear', input_type: 'number')]
      schema = service.fields_to_json_schema(fields, locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'birthyear', :enum)&.size).to be > 100
    end

    it 'properly handles the custom behaviour of the domicile field' do
      fields = [create(:custom_field_domicile)]
      create_list(:area, 5)
      schema = service.fields_to_json_schema(fields, locale)
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'domicile', :enum)).to match(Area.all.order(:ordering).map(&:id).push('outside'))
    end
  end

  describe 'fields_to_ui_schema' do
    it 'creates a valid ui schema with all input types' do
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
        { 'field1' => {},
          'field2' => { 'ui:widget': 'textarea' },
          'field3' => {},
          'field4' => {},
          'field5' => {},
          'field6' => {},
          'field7' => { 'ui:widget': 'hidden' },
          'field8' => { 'ui:widget': 'hidden' },
          'ui:order' =>
             %w[field1 field2 field3 field6 field5 field4 field7 field8] }
      )
    end
  end

  describe 'keyify' do
    it 'throws out non-valid chars' do
      str = (0..255).map { |i| i.chr('UTF-8').to_s }.join # keyify (parameterize call) does not work with ASCII strings
      expect(service.keyify(str)[0..-5]).to eq '0123456789_abcdefghijklmnopqrstuvwxyz___abcdefghijklmnopqrstuvwxyz_aaaaaaaeceeeeiiiidnoooooxouuuuythssaaaaaaaeceeeeiiiidnooooo_ouuuuythy'
    end
  end

  describe 'handle_title' do
    it 'returns the title in the requested locale' do
      field = create(:custom_field, title_multiloc: { 'en' => 'size', 'nl-NL' => 'grootte' })
      expect(service.handle_title(field, 'en')).to eq 'size'
      expect(service.handle_title(field, 'nl-NL')).to eq 'grootte'
    end

    it 'returns the title from the first available locale if the requested locale is not available' do
      field = create(:custom_field, title_multiloc: { 'en' => 'size', 'fr-FR' => 'taille' })
      expect(service.handle_title(field, 'en')).to eq 'size'
      expect(service.handle_title(field, 'fr-FR')).to eq 'taille'
      expect(service.handle_title(field, 'nl-NL')).to eq 'size'
    end
  end

  describe 'handle_description' do
    it 'returns the description in the requested locale' do
      field = create(:custom_field, description_multiloc: { 'en' => 'carrot', 'nl-NL' => 'wortel' })
      expect(service.handle_description(field, 'en')).to eq 'carrot'
      expect(service.handle_description(field, 'nl-NL')).to eq 'wortel'
    end

    it 'returns the description from the first available locale if the requested locale is not available' do
      field = create(:custom_field, description_multiloc: { 'en' => 'carrot', 'fr-FR' => 'carrotte' })
      expect(service.handle_description(field, 'en')).to eq 'carrot'
      expect(service.handle_description(field, 'fr-FR')).to eq 'carrotte'
      expect(service.handle_description(field, 'nl-NL')).to eq 'carrot'
    end
  end

  describe 'remove_not_visible_fields' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:custom_form) { create(:custom_form, participation_context: project) }

    let(:select_custom_field_with_other) do
      cf = create(:custom_field_select, resource: custom_form)
      create(:custom_field_option, custom_field: cf, key: 'option1')
      create(:custom_field_option, custom_field: cf, key: 'option2')
      create(:custom_field_option, custom_field: cf, key: 'other')
      cf
    end
    let(:select_key) { select_custom_field_with_other.key }

    let(:sentiment_custom_field_with_follow_up) do
      create(
        :custom_field_sentiment_linear_scale,
        ask_follow_up: true,
        resource: custom_form
      )
    end

    let(:sentiment_key) { sentiment_custom_field_with_follow_up.key }
    let(:author) { create(:user) }

    let(:idea) do
      create(
        :idea,
        project: project,
        author: author,
        custom_field_values: {
          select_key => 'other',
          "#{select_key}_other": 'other value',
          sentiment_key => 3,
          "#{sentiment_key}_follow_up": 'follow up value',
          key_not_matching_field: 'foo'
        }
      )
    end

    it 'does not show custom fields if user is not author or moderator' do
      values = described_class.remove_not_visible_fields(idea, create(:user))
      expect(values[select_key]).to be_nil
      expect(values[sentiment_key]).to be_nil
    end

    it 'shows custom fields if user is author' do
      values = described_class.remove_not_visible_fields(idea, author)
      expect(values[select_key]).to eq('other')
      expect(values[sentiment_key]).to eq(3)
    end

    it 'removes keys of non-existent custom fields' do
      values = described_class.remove_not_visible_fields(idea, author)
      expect(values['key_not_matching_field']).to be_nil
    end

    it 'does not remove keys of "other" or "follow_up" fields' do
      values = described_class.remove_not_visible_fields(idea, author)
      expect(values["#{select_key}_other"]).to eq('other value')
      expect(values["#{sentiment_key}_follow_up"]).to eq('follow up value')
    end
  end
end
