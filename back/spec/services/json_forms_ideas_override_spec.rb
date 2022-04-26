require 'rails_helper'

# The following specs are WIP and not implemented, and currently just serve as
# documentation for the expected behavior of the API output. It's not sure that
# this behavior should be implemented as a part of the JsonFormsService, it
# could also be done outside, so they're likely to turn into acceptance tests

describe 'JsonFormsService ideas overrides' do
  let(:service) { JsonFormsService.new }
  let(:metaschema) { JSON::Validator.validator_for_name('draft4').metaschema }
  let(:locale) { 'en' }
  let(:project) { create(:project) }
  let(:custom_form) { create(:custom_form, project: project) }
  let(:fields) { IdeaCustomFieldsService.new.all_fields(custom_form) }
  let(:user) { create(:user) }


  describe 'topic_ids field' do
    before do
      # project = create(:project)
      @projects_allowed_input_topics = create_list(:projects_allowed_input_topic, 2, project: project)
      # @custom_form = CustomForm.create(project: project)
      # @fields = IdeaCustomFieldsService.new.all_fields(@custom_form)
      project.reload
    end
    it 'only includes the topics associated with the current project' do
      schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, fields, user)[:json_schema_multiloc][locale]
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'topic_ids', :items, :oneOf)&.map { |item| item[:const] }).to match @projects_allowed_input_topics.map { |t| t.topic_id }
    end
  end

  describe 'budget field' do
    before {SettingsService.new.activate_feature! 'participatory_budgeting'}

    let(:continuous_pb_project_fields) { IdeaCustomFieldsService.new.all_fields(create(:custom_form, project: create(:continuous_budgeting_project))) }
    let(:timeline_pb_project_fields) {
      project_with_phases = create(:project_with_phases)
      project_with_phases.phases[0].update(participation_method: 'budgeting')
      IdeaCustomFieldsService.new.all_fields(create(:custom_form, project: project_with_phases))
     }
    let(:timeline_ideas_project_fields) {
      project_with_phases = create(:project_with_phases)
      IdeaCustomFieldsService.new.all_fields(create(:custom_form, project: project_with_phases))
     }

    it 'is not included for normal users' do
      schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, continuous_pb_project_fields, user)[:json_schema_multiloc][locale]
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'budget')).to be nil
    end

    context 'when admin' do
      before { user.update!(roles: [{ type: 'admin' }])}

      it 'is included in a project that has a PB phase' do
        schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, timeline_pb_project_fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'budget')).to match ({ type: 'number' })
      end

      it 'is not included in a project that has no PB phase' do
        schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, timeline_ideas_project_fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'budget')).to be nil
      end

      it 'is included in a continuous PB project' do
        schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, continuous_pb_project_fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'budget')).to match ({ type: 'number' })
      end

      it 'is not included in a continuous ideation project' do
        schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'budget')).to be nil
      end
    end
  end

  describe 'author_id field' do
    before {SettingsService.new.activate_feature! 'idea_author_change'}

    it 'is not inluded for normal users, irrespective of the feature flag' do
      schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, fields, user)[:json_schema_multiloc][locale]
      expect(JSON::Validator.validate!(metaschema, schema)).to be true
      expect(schema.dig(:properties, 'author_id')).to be nil
    end

    context 'when admin' do
      before { user.update!(roles: [{ type: 'admin' }])}

      it 'is included when the feature is active' do
        schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'author_id')).to match ({ type: 'string' })
      end

      it 'is not included when the feature is not active' do
        SettingsService.new.deactivate_feature! 'idea_author_change'
        schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, fields, user)[:json_schema_multiloc][locale]
        expect(JSON::Validator.validate!(metaschema, schema)).to be true
        expect(schema.dig(:properties, 'author_id')).to be nil
      end
    end
  end

  describe 'fields_to_ui_schema' do
    let(:continuous) { IdeaCustomFieldsService.new.all_fields(create(:custom_form, project: create(:continuous_project, input_term: 'option'))) }
    let(:timeline) {
      project_with_current_phase = create(:project_with_current_phase)
      TimelineService.new.current_phase(project_with_current_phase).update(input_term: 'option')
      IdeaCustomFieldsService.new.all_fields(create(:custom_form, project: project_with_current_phase))
    }

    it 'uses the right input_term in a continuous project' do
      ui_schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, continuous, user)[:ui_schema_multiloc][locale]
      expect(ui_schema.dig(:options, :inputTerm)).to eq 'option'
    end

    it 'uses the right input_term in a timeline project' do
      ui_schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, timeline, user)[:ui_schema_multiloc][locale]
      expect(ui_schema.dig(:options, :inputTerm)).to eq 'option'
    end

    it 'does not include the details category when there are no fields inside' do
      continuous.each { |f|
        if ['proposed_budget', 'budget', 'topic_ids', 'location_description'].include?(f.code)
          f.update(enabled: false)
        end
      }
      ui_schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, continuous, user)[:ui_schema_multiloc][locale]
      expect(ui_schema.dig(:elements)&.any? { |e| e[:options][:id] == 'details' }).to eq false
      expect(ui_schema.dig(:elements)&.any? { |e| e[:options][:id] == 'mainContent' }).to eq true
    end

    it 'does not include the images and attachments category when there are no fields inside' do
      continuous.each { |f|
        if ['idea_images_attributes', 'idea_files_attributes'].include?(f.code)
          f.update(enabled: false)
        end
      }
      ui_schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, continuous, user)[:ui_schema_multiloc][locale]
      expect(ui_schema.dig(:elements)&.any? { |e| e[:options][:id] == 'attachments' }).to eq false
      expect(ui_schema.dig(:elements)&.any? { |e| e[:options][:id] == 'mainContent' }).to eq true
    end

    it 'does not include an extra category when there are only built-in fields' do
      ui_schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, fields, user)[:ui_schema_multiloc][locale]
      expect(ui_schema.dig(:elements)&.any? { |e| e[:options][:id] == 'extra' }).to eq false
      expect(ui_schema.dig(:elements)&.any? { |e| e[:options][:id] == 'mainContent' }).to eq true
    end

    it 'includes all non built-in fields in an extra category' do
      fields.push(create(:custom_field_extra_custom_form, resource: custom_form))
      ui_schema = service.ui_and_json_multiloc_schemas(AppConfiguration.instance, fields, user)[:ui_schema_multiloc][locale]
      expect(ui_schema.dig(:elements)&.any? { |e| e[:options][:id] == 'extra' }).to eq true
      expect(ui_schema.dig(:elements)&.find { |e| e[:options][:id] == 'extra' }.dig(:elements)&.count).to eq 1
      expect(ui_schema.dig(:elements)&.any? { |e| e[:options][:id] == 'mainContent' }).to eq true
    end
  end
end
