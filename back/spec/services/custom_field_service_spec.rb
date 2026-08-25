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

  describe 'delete_custom_field_values' do
    it 'deletes the custom field values from all users' do
      cf1 = create(:custom_field)
      cf2 = create(:custom_field)
      create_list(:user, 5, custom_field_values: { cf1.key => 'some_value', cf2.key => 'other_value' })
      create_list(:user, 5)
      service.delete_custom_field_values(cf1)
      expect(User.all.map { |u| u.custom_field_values.keys }.flatten).to include(cf2.key)
      expect(User.all.map { |u| u.custom_field_values.keys }.flatten).not_to include(cf1.key)
      expect(CustomFieldAnswer.where(key: cf1.key)).not_to exist
      expect(CustomFieldAnswer.where(key: cf2.key).count).to eq 5
    end

    it 'deletes the values that a user field stored on inputs through user fields in form' do
      field = create(:custom_field, key: 'the_field')
      user = create(:user, custom_field_values: { 'the_field' => 'other', 'the_field_other' => 'gone' })
      input = create(:idea, custom_field_values: { 'u_the_field' => 'other', 'u_the_field_other' => 'gone', 'other_field' => 'stays' })

      service.delete_custom_field_values(field)

      expect(user.reload.custom_field_values).to eq({})
      expect(input.reload.custom_field_values).to eq({ 'other_field' => 'stays' })
      expect(user.custom_field_answers).to be_empty
      expect(input.custom_field_answers.pluck(:key)).to eq ['other_field']
    end

    it 'deletes the values of a phase-level form field from the inputs of its phase' do
      phase = create(:single_phase_native_survey_project).phases.first
      form = create(:custom_form, participation_context: phase)
      field = create(:custom_field_text, resource: form, key: 'extra_field')
      input = create(
        :idea,
        project: phase.project,
        creation_phase: phase,
        custom_field_values: { 'extra_field' => 'gone', 'extra_field_follow_up' => 'gone', 'another_field' => 'stays' }
      )

      service.delete_custom_field_values(field)

      expect(input.reload.custom_field_values).to eq({ 'another_field' => 'stays' })
      expect(input.custom_field_answers.pluck(:key)).to eq ['another_field']
    end

    it 'does not delete values of inputs in other participation contexts with the same field key' do
      other_phase = create(:single_phase_native_survey_project).phases.first
      create(:custom_form, participation_context: other_phase)
      other_input = create(
        :idea,
        project: other_phase.project,
        creation_phase: other_phase,
        custom_field_values: { 'extra_field' => 'stays' }
      )

      phase = create(:single_phase_native_survey_project).phases.first
      form = create(:custom_form, participation_context: phase)
      field = create(:custom_field_text, resource: form, key: 'extra_field')

      service.delete_custom_field_values(field)

      expect(other_input.reload.custom_field_values).to eq({ 'extra_field' => 'stays' })
      expect(other_input.custom_field_answers.pluck(:key, :value)).to eq [%w[extra_field stays]]
    end
  end

  describe 'delete_custom_field_option_values' do
    it 'deletes the custom field option values from all users for a multiselect' do
      cf1 = create(:custom_field_multiselect)
      cfo1 = create(:custom_field_option, custom_field: cf1)
      cfo2 = create(:custom_field_option, custom_field: cf1)
      cf2 = create(:custom_field_select)
      cfo3 = create(:custom_field_option, custom_field: cf2)
      v1 = { cf1.key => [cfo1.key], cf2.key => cfo3.key }
      u1 = create(:user, custom_field_values: v1)
      v2 = { cf1.key => [cfo1.key, cfo2.key] }
      u2 = create(:user, custom_field_values: v2)
      v3 = { cf1.key => [cfo2.key] }
      u3 = create(:user, custom_field_values: v3)

      service.delete_custom_field_option_values(cfo1.key, cfo1.custom_field)

      expect(u1.reload.custom_field_values).to eq({ cf2.key => cfo3.key })
      expect(u2.reload.custom_field_values).to eq({ cf1.key => [cfo2.key] })
      expect(u3.reload.custom_field_values).to eq v3
      expect(u1.custom_field_answers.pluck(:key, :value)).to eq [[cf2.key, cfo3.key]]
      expect(u2.custom_field_answers.pluck(:key, :value)).to eq [[cf1.key, [cfo2.key]]]
      expect(u3.custom_field_answers.pluck(:key, :value)).to eq [[cf1.key, [cfo2.key]]]
    end

    it 'deletes the custom field option values from all users for a single select' do
      cf1 = create(:custom_field_select)
      cfo1 = create(:custom_field_option, custom_field: cf1)
      cfo2 = create(:custom_field_option, custom_field: cf1)
      v1 = { cf1.key => cfo1.key }
      u1 = create(:user, custom_field_values: v1)
      v2 = { cf1.key => cfo2.key }
      u2 = create(:user, custom_field_values: v2)

      service.delete_custom_field_option_values(cfo1.key, cfo1.custom_field)

      expect(u1.reload.custom_field_values).to eq({})
      expect(u2.reload.custom_field_values).to eq v2
      expect(u1.custom_field_answers).to be_empty
      expect(u2.custom_field_answers.pluck(:key, :value)).to eq [[cf1.key, cfo2.key]]
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
        create(:custom_field, key: 'field10', input_type: 'point'),
        create(:custom_field, key: 'field11', input_type: 'multipoint')
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
              type: 'string' },
                        'field11' =>
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
