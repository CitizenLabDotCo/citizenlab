# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:custom_form) { create(:custom_form) }
  let(:service) { described_class.new custom_form }

  describe 'all_fields' do
    it 'outputs valid custom fields' do
      expect(service.all_fields).to all(be_valid)
    end

    it 'takes the order of the built-in fields' do
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
      if CitizenLab.ee?
        expect(output).to match_array [:required_field, :optional_field, { multiselect_field: [] }]
      else
        expect(output).to match_array [{}]
      end
    end
  end
end
