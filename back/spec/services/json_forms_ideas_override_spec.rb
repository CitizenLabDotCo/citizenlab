# frozen_string_literal: true

require 'rails_helper'

# The following specs are WIP and not implemented, and currently just serve as
# documentation for the expected behavior of the API output. It's not sure that
# this behavior should be implemented as a part of the JsonFormsService, it
# could also be done outside, so they're likely to turn into acceptance tests

describe JsonFormsService do
  let(:service) { described_class.new }
  let(:metaschema) { JSON::Validator.validator_for_name('draft4').metaschema }
  let(:locale) { 'en' }
  let(:project) { create(:project) }
  let(:custom_form) { create(:custom_form, project: project) }
  let(:fields) { IdeaCustomFieldsService.new(custom_form).visible_fields }
  let(:user) { create(:user) }

  describe '#custom_form_to_json_schema' do
    context 'when there are default fields only' do
      it 'returns the JSON schema for all enabled built-in fields' do
        schema = service.custom_form_to_json_schema(fields)
        expect(schema).to eq({
          type: 'object',
          additionalProperties: false,
          properties: {
            'author_id' => { type: 'string' },
            'budget' => { type: 'number' },
            'title_multiloc' => {
              type: 'object',
              minProperties: 1,
              properties: {
                'en' => { type: 'string', minLength: 10, maxLength: 80 },
                'fr-FR' => { type: 'string', minLength: 10, maxLength: 80 },
                'nl-NL' => { type: 'string', minLength: 10, maxLength: 80 }
              }
            },
            'body_multiloc' => {
              type: 'object',
              minProperties: 1,
              properties: {
                'en' => { type: 'string', minLength: 40 },
                'fr-FR' => { type: 'string', minLength: 40 },
                'nl-NL' => { type: 'string', minLength: 40 }
              }
            },
            'topic_ids' => {
              type: 'array',
              uniqueItems: true,
              minItems: 0,
              items: { type: 'string' }
            },
            'location_description' => { type: 'string' },
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
            }
          },
          required: %w[title_multiloc body_multiloc]
        })
      end
    end

    context 'when there is a required extra field' do
      let!(:custom_field) { create(:custom_field_number, required: true, resource: custom_form) }

      if CitizenLab.ee?
        it 'returns the JSON schema for all enabled built-in fields, and the extra field' do
          schema = service.custom_form_to_json_schema(fields)
          expect(schema).to match({
            type: 'object',
            additionalProperties: false,
            properties: {
              'author_id' => { type: 'string' },
              'budget' => { type: 'number' },
              'title_multiloc' => {
                type: 'object',
                minProperties: 1,
                properties: {
                  'en' => { type: 'string', minLength: 10, maxLength: 80 },
                  'fr-FR' => { type: 'string', minLength: 10, maxLength: 80 },
                  'nl-NL' => { type: 'string', minLength: 10, maxLength: 80 }
                }
              },
              'body_multiloc' => {
                type: 'object',
                minProperties: 1,
                properties: {
                  'en' => { type: 'string', minLength: 40 },
                  'fr-FR' => { type: 'string', minLength: 40 },
                  'nl-NL' => { type: 'string', minLength: 40 }
                }
              },
              'topic_ids' => {
                type: 'array',
                uniqueItems: true,
                minItems: 0,
                items: { type: 'string' }
              },
              'location_description' => { type: 'string' },
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
              custom_field.key => { type: 'number' }
            },
            required: match_array(['title_multiloc', 'body_multiloc', custom_field.key])
          })
        end
      else
        it 'returns the JSON schema for all enabled non-hidden default fields (the extra field is ignored)' do
          schema = service.custom_form_to_json_schema(fields)
          expect(schema).to eq({
            type: 'object',
            additionalProperties: false,
            properties: {
              'author_id' => { type: 'string' },
              'budget' => { type: 'number' },
              'title_multiloc' => {
                type: 'object',
                minProperties: 1,
                properties: {
                  'en' => { type: 'string', minLength: 10, maxLength: 80 },
                  'fr-FR' => { type: 'string', minLength: 10, maxLength: 80 },
                  'nl-NL' => { type: 'string', minLength: 10, maxLength: 80 }
                }
              },
              'body_multiloc' => {
                type: 'object',
                minProperties: 1,
                properties: {
                  'en' => { type: 'string', minLength: 40 },
                  'fr-FR' => { type: 'string', minLength: 40 },
                  'nl-NL' => { type: 'string', minLength: 40 }
                }
              },
              'topic_ids' => {
                type: 'array',
                uniqueItems: true,
                minItems: 0,
                items: { type: 'string' }
              },
              'location_description' => { type: 'string' },
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
              }
            },
            required: %w[title_multiloc body_multiloc]
          })
        end
      end
    end
  end

  describe 'topic_ids field' do
    before do
      # project = create(:project)
      @projects_allowed_input_topics = create_list(:projects_allowed_input_topic, 2, project: project)
      # @custom_form = CustomForm.create(project: project)
      # @fields = IdeaCustomFieldsService.new.all_fields(@custom_form)
      project.reload
    end

    it 'only includes the topics associated with the current project' do
      schema = service.ui_and_json_multiloc_schemas(fields, user)[:json_schema_multiloc][locale]
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'topic_ids', :items, :oneOf).pluck(:const)).to match @projects_allowed_input_topics.map(&:topic_id)
    end
  end

  describe 'fields_to_ui_schema' do
    let(:continuous) { IdeaCustomFieldsService.new(create(:custom_form, project: create(:continuous_project, input_term: 'option'))).all_fields }
    let(:timeline) do
      project_with_current_phase = create(:project_with_current_phase)
      TimelineService.new.current_phase(project_with_current_phase).update(input_term: 'option')
      IdeaCustomFieldsService.new(create(:custom_form, project: project_with_current_phase)).all_fields
    end

    it 'uses the right input_term in a continuous project' do
      ui_schema = service.ui_and_json_multiloc_schemas(continuous, user)[:ui_schema_multiloc][locale]
      expect(ui_schema.dig(:options, :inputTerm)).to eq 'option'
    end

    it 'uses the right input_term in a timeline project' do
      ui_schema = service.ui_and_json_multiloc_schemas(timeline, user)[:ui_schema_multiloc][locale]
      expect(ui_schema.dig(:options, :inputTerm)).to eq 'option'
    end

    it 'does not include the details category when there are no fields inside' do
      codes = %w[proposed_budget budget topic_ids location_description]
      continuous.each do |f|
        if codes.include?(f.code)
          f.update(enabled: false)
        end
      end
      ui_schema = service.ui_and_json_multiloc_schemas(continuous, user)[:ui_schema_multiloc][locale]
      expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'details' }).to be false
      expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'mainContent' }).to be true
    end

    it 'does not include the images and attachments category when there are no fields inside' do
      codes = %w[idea_images_attributes idea_files_attributes]
      continuous.each do |f|
        if codes.include?(f.code)
          f.update(enabled: false)
        end
      end
      ui_schema = service.ui_and_json_multiloc_schemas(continuous, user)[:ui_schema_multiloc][locale]
      expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'attachments' }).to be false
      expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'mainContent' }).to be true
    end

    it 'does not include an extra category when there are only built-in fields' do
      ui_schema = service.ui_and_json_multiloc_schemas(fields, user)[:ui_schema_multiloc][locale]
      expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'extra' }).to be false
      expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'mainContent' }).to be true
    end

    it 'includes all non built-in fields in an extra category' do
      fields.push(create(:custom_field_extra_custom_form, resource: custom_form))
      ui_schema = service.ui_and_json_multiloc_schemas(fields, user)[:ui_schema_multiloc][locale]
      expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'extra' }).to be true
      expect(ui_schema[:elements].find { |e| e[:options][:id] == 'extra' }[:elements].size).to eq 1
      expect(ui_schema[:elements].any? { |e| e[:options][:id] == 'mainContent' }).to be true
    end

    it 'gives all non built-in fields a nested path' do
      fields.push(create(:custom_field_extra_custom_form, resource: custom_form))
      ui_schema = service.ui_and_json_multiloc_schemas(fields, user)[:ui_schema_multiloc][locale]
      expect(ui_schema[:elements].find { |e| e[:options][:id] == 'extra' }[:elements].size).to eq 1
      expect(ui_schema[:elements].find { |e| e[:options][:id] == 'extra' }[:elements].first[:scope]).to eq '#/properties/extra_field'
    end
  end
end
