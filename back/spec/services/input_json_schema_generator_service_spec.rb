# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputJsonSchemaGeneratorService do
  subject(:generator) { described_class.new }

  let(:field_key) { 'field_key' }

  describe '#generate_for' do
    let(:metaschema) { JSON::Validator.validator_for_name('draft4').metaschema }
    let(:project) { create(:single_phase_ideation_project) }
    let(:custom_form) { create(:custom_form, participation_context: project) }
    let(:ui_schema) { generator.generate_for IdeaCustomFieldsService.new(custom_form).enabled_fields }

    context 'for a project with an ideation phase and the default form at project level' do
      it 'returns the JSON schema for all enabled built-in fields' do
        expect(JSON::Validator.validate!(metaschema, ui_schema)).to be true
        expect(ui_schema['en']).to eq({
          type: 'object',
          additionalProperties: false,
          properties: {
            'title_multiloc' => {
              type: 'object',
              minProperties: 1,
              properties: {
                'en' => { type: 'string', minLength: 3, maxLength: 120 },
                'fr-FR' => { type: 'string', minLength: 3, maxLength: 120 },
                'nl-NL' => { type: 'string', minLength: 3, maxLength: 120 }
              }
            },
            'body_multiloc' => {
              type: 'object',
              minProperties: 1,
              properties: {
                'en' => { type: 'string', minLength: 3 },
                'fr-FR' => { type: 'string', minLength: 3 },
                'nl-NL' => { type: 'string', minLength: 3 }
              }
            },
            'idea_images_attributes' => {
              type: 'array',
              items: {
                type: 'object',
                properties: { image: { type: 'string' } }
              }
            },
            'idea_files_attributes' => {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file_by_content: {
                    type: 'object',
                    properties: { file: { type: 'string' }, name: { type: 'string' } }
                  },
                  name: { type: 'string' }
                }
              }
            },
            'topic_ids' => {
              type: 'array',
              uniqueItems: true,
              minItems: 0,
              items: { type: 'string' }
            },
            'location_description' => { type: 'string' }
          },
          required: %w[title_multiloc body_multiloc]
        })
      end
    end

    context 'when there is a required extra field' do
      let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
      let!(:custom_field) { create(:custom_field_number, required: true, resource: custom_form) }

      it 'returns the JSON schema for all enabled built-in fields, and the extra field' do
        expect(JSON::Validator.validate!(metaschema, ui_schema)).to be true
        expect(ui_schema['en']).to match({
          type: 'object',
          additionalProperties: false,
          properties: {
            'title_multiloc' => {
              type: 'object',
              minProperties: 1,
              properties: {
                'en' => { type: 'string', minLength: 3, maxLength: 120 },
                'fr-FR' => { type: 'string', minLength: 3, maxLength: 120 },
                'nl-NL' => { type: 'string', minLength: 3, maxLength: 120 }
              }
            },
            'body_multiloc' => {
              type: 'object',
              minProperties: 1,
              properties: {
                'en' => { type: 'string', minLength: 3 },
                'fr-FR' => { type: 'string', minLength: 3 },
                'nl-NL' => { type: 'string', minLength: 3 }
              }
            },
            'idea_images_attributes' => {
              type: 'array',
              items: {
                type: 'object',
                properties: { image: { type: 'string' } }
              }
            },
            'idea_files_attributes' => {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file_by_content: {
                    type: 'object',
                    properties: { file: { type: 'string' }, name: { type: 'string' } }
                  },
                  name: { type: 'string' }
                }
              }
            },
            'topic_ids' => {
              type: 'array',
              uniqueItems: true,
              minItems: 0,
              items: { type: 'string' }
            },
            'location_description' => { type: 'string' },
            custom_field.key => { type: 'number' }
          },
          required: match_array(['title_multiloc', 'body_multiloc', custom_field.key])
        })
      end
    end
  end

  describe '#visit_text_multiloc' do
    context 'when the code is title_multiloc' do
      let(:field) { create(:custom_field, input_type: 'text_multiloc', code: 'title_multiloc', key: field_key) }

      it 'returns the schema for the given built-in field' do
        expect(generator.visit_text_multiloc(field)).to eq({
          type: 'object',
          minProperties: 1,
          properties: {
            'en' => {
              type: 'string',
              minLength: 3,
              maxLength: 120
            },
            'fr-FR' => {
              type: 'string',
              minLength: 3,
              maxLength: 120
            },
            'nl-NL' => {
              type: 'string',
              minLength: 3,
              maxLength: 120
            }
          }
        })
      end
    end

    context 'when the code is something else' do
      let(:field) { create(:custom_field, input_type: 'text_multiloc', key: field_key) }

      it 'returns the schema for the given field' do
        expect(generator.visit_text_multiloc(field)).to eq({
          type: 'object',
          minProperties: 1,
          properties: {
            'en' => { type: 'string' },
            'fr-FR' => { type: 'string' },
            'nl-NL' => { type: 'string' }
          }
        })
      end
    end
  end

  describe '#visit_html_multiloc' do
    context 'when the code is body_multiloc' do
      let(:field) { create(:custom_field, input_type: 'html_multiloc', code: 'body_multiloc', key: field_key) }

      it 'returns the schema for the given built-in field' do
        expect(generator.visit_html_multiloc(field)).to eq({
          type: 'object',
          minProperties: 1,
          properties: {
            'en' => {
              type: 'string',
              minLength: 3
            },
            'fr-FR' => {
              type: 'string',
              minLength: 3
            },
            'nl-NL' => {
              type: 'string',
              minLength: 3
            }
          }
        })
      end
    end

    context 'when the code is something else' do
      let(:field) { create(:custom_field, input_type: 'html_multiloc', key: field_key) }

      it 'returns the schema for the given field' do
        expect(generator.visit_html_multiloc(field)).to eq({
          type: 'object',
          minProperties: 1,
          properties: {
            'en' => { type: 'string' },
            'fr-FR' => { type: 'string' },
            'nl-NL' => { type: 'string' }
          }
        })
      end
    end
  end

  describe '#visit_topic_ids' do
    let(:project) do
      create(
        :project_with_allowed_input_topics,
        allowed_input_topics_count: allowed_input_topics_count
      )
    end
    let(:topics) { project.allowed_input_topics }
    let(:form) { create(:custom_form, :with_default_fields, participation_context: project) }
    let(:field) { form.custom_fields.find_by(code: 'topic_ids') }

    context 'when not required, and without topics' do
      let(:allowed_input_topics_count) { 0 }
      let(:form) { create(:custom_form, :with_default_fields) }

      it 'returns the schema for the given field' do
        expect(generator.visit_topic_ids(field)).to eq({
          type: 'array',
          uniqueItems: true,
          minItems: 0,
          items: {
            type: 'string'
          }
        })
      end
    end

    context 'when not required, and with topics' do
      let(:allowed_input_topics_count) { 2 }

      it 'returns the schema for the given field' do
        expect(generator.visit_topic_ids(field)).to match({
          type: 'array',
          uniqueItems: true,
          minItems: 0,
          items: {
            type: 'string',
            oneOf: [
              {
                const: topics[0].id,
                title: topics[0].title_multiloc['en']
              },
              {
                const: topics[1].id,
                title: topics[1].title_multiloc['en']
              }
            ]
          }
        })
      end
    end

    context 'when required, and with topics' do
      let(:allowed_input_topics_count) { 2 }

      it 'returns the schema for the given field' do
        field.update!(required: true)
        expect(generator.visit_topic_ids(field)).to eq({
          type: 'array',
          uniqueItems: true,
          minItems: 1,
          items: {
            type: 'string',
            oneOf: [
              {
                const: topics[0].id,
                title: topics[0].title_multiloc['en']
              },
              {
                const: topics[1].id,
                title: topics[1].title_multiloc['en']
              }
            ]
          }
        })
      end
    end
  end

  describe '#visit_multiselect' do
    context 'when not required, and without options' do
      let(:field) { create(:custom_field_select, input_type: 'multiselect', key: field_key) }

      it 'returns the schema for the given field' do
        expect(generator.visit_multiselect(field)).to eq({
          type: 'array',
          uniqueItems: true,
          minItems: 0,
          maxItems: 0,
          items: {
            type: 'string'
          }
        })
      end
    end

    context 'when not required, and with options' do
      let(:field) { create(:custom_field_select, :with_options, input_type: 'multiselect', key: field_key) }

      it 'returns the schema for the given field' do
        expect(generator.visit_multiselect(field)).to eq({
          type: 'array',
          uniqueItems: true,
          minItems: 0,
          maxItems: 2,
          items: {
            type: 'string',
            oneOf: [
              {
                const: 'option1',
                title: 'youth council'
              },
              {
                const: 'option2',
                title: 'youth council'
              }
            ]
          }
        })
      end
    end

    context 'when required, and with options' do
      let(:field) { create(:custom_field_select, :with_options, input_type: 'multiselect', key: field_key, required: true) }

      it 'returns the schema for the given field' do
        expect(generator.visit_multiselect(field)).to eq({
          type: 'array',
          uniqueItems: true,
          minItems: 1,
          maxItems: 2,
          items: {
            type: 'string',
            oneOf: [
              {
                const: 'option1',
                title: 'youth council'
              },
              {
                const: 'option2',
                title: 'youth council'
              }
            ]
          }
        })
      end
    end
  end
end
