# frozen_string_literal: true

require 'rails_helper'

describe 'JsonFormsService ideas overrides' do
  let(:service) { JsonFormsService.new }
  let(:metaschema) { JSON::Validator.validator_for_name('draft4').metaschema }
  let(:locale) { 'en' }
  let(:project) { create(:project) }
  let(:custom_form) { create(:custom_form, project: project) }
  let(:fields) { IdeaCustomFieldsService.new(custom_form).visible_fields }
  let(:user) { create(:user) }

  describe '#custom_form_to_json_schema' do
    context 'when there are default fields only' do
      it 'returns the JSON schema for all enabled non-hidden default fields' do
        schema = service.custom_form_to_json_schema(fields)
        expect(schema).to eq({
          type: 'object',
          additionalProperties: false,
          properties: {
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
            'author_id' => { type: 'string' },
            'budget' => { type: 'number' },
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
            'custom_field_values' => {
              type: 'object',
              additionalProperties: false,
              properties: {}
            }
          },
          required: %w[title_multiloc body_multiloc]
        })
      end
    end

    context 'when there is a required extra field' do
      let!(:custom_field) { create(:custom_field_number, required: true, resource: custom_form) }

      if CitizenLab.ee?
        it 'returns the JSON schema for all enabled non-hidden default fields, and the extra field' do
          schema = service.custom_form_to_json_schema(fields)
          expect(schema).to eq({
            type: 'object',
            additionalProperties: false,
            properties: {
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
              'author_id' => { type: 'string' },
              'budget' => { type: 'number' },
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
              'custom_field_values' => {
                type: 'object',
                additionalProperties: false,
                properties: { custom_field.key => { type: 'number' } },
                required: [custom_field.key]
              }
            },
            required: %w[title_multiloc body_multiloc]
          })
        end
      else
        it 'returns the JSON schema for all enabled non-hidden default fields (the extra field is ignored)' do
          schema = service.custom_form_to_json_schema(fields)
          expect(schema).to eq({
            type: 'object',
            additionalProperties: false,
            properties: {
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
              'author_id' => { type: 'string' },
              'budget' => { type: 'number' },
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
              'custom_field_values' => {
                type: 'object',
                additionalProperties: false,
                properties: {}
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

  describe 'budget field' do
    before { SettingsService.new.activate_feature! 'participatory_budgeting' }

    let(:continuous_pb_project_fields) { IdeaCustomFieldsService.new(create(:custom_form, project: create(:continuous_budgeting_project))).all_fields }
    let(:timeline_pb_project_fields) do
      project_with_phases = create(:project_with_phases)
      project_with_phases.phases[0].update(participation_method: 'budgeting')
      IdeaCustomFieldsService.new(create(:custom_form, project: project_with_phases)).all_fields
    end
    let(:timeline_ideas_project_fields) do
      project_with_phases = create(:project_with_phases)
      IdeaCustomFieldsService.new(create(:custom_form, project: project_with_phases)).all_fields
    end

    it 'is not included for normal users' do
      schema = service.ui_and_json_multiloc_schemas(continuous_pb_project_fields, user)[:json_schema_multiloc][locale]
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'budget')).to be_nil
    end

    context 'when admin' do
      before { user.update!(roles: [{ type: 'admin' }]) }

      it 'is included in a project that has a PB phase' do
        schema = service.ui_and_json_multiloc_schemas(timeline_pb_project_fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'budget')).to match({ type: 'number' })
      end

      it 'is not included in a project that has no PB phase' do
        schema = service.ui_and_json_multiloc_schemas(timeline_ideas_project_fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'budget')).to be_nil
      end

      it 'is included in a continuous PB project' do
        schema = service.ui_and_json_multiloc_schemas(continuous_pb_project_fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'budget')).to match({ type: 'number' })
      end

      it 'is not included in a continuous ideation project' do
        schema = service.ui_and_json_multiloc_schemas(fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'budget')).to be_nil
      end
    end
  end

  describe 'author_id field' do
    before { SettingsService.new.activate_feature! 'idea_author_change' }

    it 'is not inluded for normal users, irrespective of the feature flag' do
      schema = service.ui_and_json_multiloc_schemas(fields, user)[:json_schema_multiloc][locale]
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'author_id')).to be_nil
    end

    context 'when admin' do
      before { user.update!(roles: [{ type: 'admin' }]) }

      it 'is included when the feature is active' do
        schema = service.ui_and_json_multiloc_schemas(fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'author_id')).to match({ type: 'string' })
      end

      it 'is not included when the feature is not active' do
        SettingsService.new.deactivate_feature! 'idea_author_change'
        schema = service.ui_and_json_multiloc_schemas(fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'author_id')).to be_nil
      end
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
      expect(ui_schema[:elements].find { |e| e[:options][:id] == 'extra' }[:elements].first[:scope]).to eq '#/properties/custom_field_values/properties/extra_field'
    end
  end
end
