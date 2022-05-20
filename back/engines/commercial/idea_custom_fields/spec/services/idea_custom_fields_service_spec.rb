# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:service) { described_class.new }

  describe 'all_fields' do
    it 'overrides built in custom fields with database custom fields by code' do
      custom_form = create(:custom_form)
      cf1 = create(:custom_field, resource: custom_form, code: 'title_multiloc')
      cf2 = create(:custom_field, resource: custom_form, code: nil)
      output = service.all_fields(custom_form, filter_unmodifiable: true)
      expect(output).to include cf1
      expect(output).to include cf2
      expect(output.map(&:code)).to match_array [
        'title_multiloc',
        'body_multiloc',
        'topic_ids',
        'location_description',
        'proposed_budget',
        'idea_images_attributes',
        'idea_files_attributes',
        nil
      ]
    end

    it 'outputs valid custom fields' do
      custom_form = create(:custom_form)
      expect(service.all_fields(custom_form)).to all(be_valid)
    end

    it "doesn't return anything outside of the passed custom_fields_scope" do
      custom_form = create(:custom_form)
      cf1 = create(:custom_field, resource: custom_form)
      cf2 = create(:custom_field, resource: custom_form)
      custom_fields_scope = CustomField.where(id: cf1)
      output = service.all_fields(custom_form, custom_fields_scope: custom_fields_scope)
      expect(output.size).to be > 1
      expect(output).not_to include(cf2)
    end

    it 'takes the order of the built-in fields' do
      custom_form = create(:custom_form)
      cf1 = create(:custom_field, resource: custom_form, code: 'location_description')
      output = service.all_fields(custom_form, filter_unmodifiable: true)
      expect(output).to include cf1
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
end
