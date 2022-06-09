# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:service) { described_class.new }

  describe 'all_fields' do
    it 'outputs valid custom fields' do
      custom_form = create(:custom_form)
      expect(service.all_fields(custom_form)).to all(be_valid)
    end

    it 'takes the order of the built-in fields' do
      custom_form = create(:custom_form)
      output = service.all_fields(custom_form)
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
    it 'lists keys' do
      project = create :project
      form = create :custom_form, project: project
      create(
        :custom_field,
        :for_custom_form,
        resource: form,
        required: true,
        input_type: 'date',
        key: 'required_field'
      )
      optional_field = create(
        :custom_field_select,
        :for_custom_form,
        resource: form,
        required: false,
        key: 'optional_field'
      )
      create(
        :custom_field_multiselect,
        :for_custom_form,
        resource: form,
        required: false,
        key: 'multiselect_field'
      )
      create :custom_field_option, custom_field: optional_field
      create(
        :custom_field_multiselect,
        :for_custom_form,
        resource: form,
        required: true,
        key: 'topic_ids',
        code: 'topic_ids'
      )

      output = service.allowed_extra_field_keys form
      if CitizenLab.ee?
        expect(output).to match_array [:required_field, :optional_field, { multiselect_field: [] }]
      else
        expect(output).to match_array [{}]
      end
    end
  end
end
