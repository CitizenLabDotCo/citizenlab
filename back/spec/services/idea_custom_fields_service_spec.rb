# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:project) { create :continuous_project, participation_method: 'ideation' }
  let(:custom_form) { create :custom_form, participation_context: project }
  let(:service) { described_class.new custom_form }
  let(:participation_context) { Factory.instance.participation_method_for project }

  describe 'all_fields' do
    it 'outputs valid custom fields' do
      expect(service.all_fields).to all(be_valid)
    end

    it 'returns the built-in fields when no fields were persisted' do
      output = service.all_fields
      expect(output.map(&:code)).to eq %w[
        title_multiloc
        body_multiloc
        author_id
        budget
        proposed_budget
        topic_ids
        location_description
        idea_images_attributes
        idea_files_attributes
      ]
    end

    it 'only returns persisted fields when some fields were persisted' do
      cf1 = participation_context.default_fields.find { |field| field.code == 'title_multiloc' }.save!
      cf2 = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.all_fields
      expect(output).to include cf1
      expect(output).to include cf2
      expect(output).to include disabled_field
      expect(output).to include topic_field
      expect(output.map(&:code)).to eq [
        'title_multiloc',
        'topic_ids',
        nil,
        nil
      ]
    end
  end

  describe 'configurable_fields' do
    it 'returns all fields except author_id and budget' do
      output = service.configurable_fields
      expect(output.map(&:code)).to eq %w[
        title_multiloc
        body_multiloc
        proposed_budget
        topic_ids
        location_description
        idea_images_attributes
        idea_files_attributes
      ]

      create :custom_field, resource: custom_form, code: 'title_multiloc'
      create :custom_field, resource: custom_form, code: 'budget'
      create :custom_field, resource: custom_form, key: 'extra_field1', enabled: true
      create :custom_field, resource: custom_form, key: 'extra_field2', enabled: false
      output = service.configurable_fields
      expect(output.map(&:key)).to eq %w[
        title_multiloc
        extra_field1
        extra_field2
      ]
    end
  end

  describe 'allowed_extra_field_keys' do
    let(:project) { create :project }
    let(:custom_form) { create :custom_form, participation_context: project }

    it 'lists keys' do
      create(
        :custom_field,
        :for_custom_form,
        resource: custom_form,
        required: true,
        input_type: 'date',
        key: 'required_field'
      )
      optional_field = create(
        :custom_field_select,
        :for_custom_form,
        resource: custom_form,
        required: false,
        key: 'optional_field'
      )
      create(
        :custom_field_multiselect,
        :for_custom_form,
        resource: custom_form,
        required: false,
        key: 'multiselect_field'
      )
      create :custom_field_option, custom_field: optional_field
      create(
        :custom_field_multiselect,
        :for_custom_form,
        resource: custom_form,
        required: true,
        key: 'topic_ids',
        code: 'topic_ids'
      )

      output = service.allowed_extra_field_keys
      expect(output).to match_array [:required_field, :optional_field, { multiselect_field: [] }]
    end
  end
end
