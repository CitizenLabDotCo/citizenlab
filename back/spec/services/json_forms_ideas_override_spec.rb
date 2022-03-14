require "rails_helper"

# The following specs are WIP and not implemented, and currently just serve as
# documentation for the expected behavior of the API output. It's not sure that
# this behavior should be implemented as a part of the JsonFormsService, it
# could also be done outside, so they're likely to turn into acceptance tests

describe 'JsonFormsService ideas overrides' do
  let(:service) { JsonFormsService.new }
  let(:metaschema) { JSON::Validator.validator_for_name("draft4").metaschema }
  let(:locale) { "en" }

  describe 'topic_ids field' do
    before do
      project = create(:project)
      @projects_allowed_input_topics = create_list(:projects_allowed_input_topic, 2, project: project)
      @custom_form = CustomForm.create(project: project)
      project.reload
    end
    it 'only includes the topics associated with the current project' do
      fields = [create(:custom_field, key: 'topic_ids', code: 'topic_ids', input_type: 'multiselect', resource: @custom_form)]
      schema = service.fields_to_json_schema(fields, locale)
      expect(schema.dig(:properties, 'topic_ids', :items, :oneOf).map { |item| item[:const] }).to match @projects_allowed_input_topics.map { |t| t.topic_id }
    end
  end

  describe 'budget field' do
    it 'is not included for normal users' do

    end

    context 'when admin' do
      it 'is included in a project that has a PB phase' do

      end

      it 'is not included in a project that has no PB phase' do

      end

      it 'is included in a continuous PB project' do

      end

      it 'is not included in a continuous ideation project' do

      end
    end

    it 'has a privileged: true option' do

    end
  end

  describe 'author_id field' do
    it 'is not inluded for normal users, irrespective of the feature flag' do

    end

    context 'when admin' do
      it 'is included when the feature is active' do

      end

      it 'is not included when the feature is not active' do

      end
    end
  end

  describe 'fields_to_ui_schema' do
    it 'uses the right input_term in the first category label' do

    end

    it 'does not include the details category when there are no fields inside' do

    end

    it 'does not include the images and attachments category when there are no fields inside' do

    end

    it 'includes all non built-in fields in an extra category' do

    end

    it 'does not include an extra category when there are only built-in fields' do

    end
  end
end
