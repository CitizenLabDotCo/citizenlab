# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:service) { described_class.new }

  describe 'all_fields' do
    it 'overrides built in custom fields with database custom fields by code' do
      custom_form = create(:custom_form)
      cf1 = create(:custom_field, resource: custom_form, code: 'title_multiloc')
      cf2 = create(:custom_field, resource: custom_form, code: nil)
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.all_fields custom_form
      expect(output).to include cf1
      expect(output).to include cf2
      expect(output).to include disabled_field
      expect(output).to include topic_field
      expect(output.map(&:code)).to match_array [
        'title_multiloc',
        'body_multiloc',
        'location_description',
        'proposed_budget',
        'idea_images_attributes',
        'idea_files_attributes',
        'topic_ids',
        'author_id',
        'budget',
        'location_point_geojson',
        nil,
        nil
      ]
    end

    it 'outputs valid custom fields' do
      custom_form = create(:custom_form)
      expect(service.all_fields(custom_form)).to all(be_valid)
    end

    it 'takes the order of the built-in fields' do
      custom_form = create(:custom_form)
      cf1 = create(:custom_field, resource: custom_form, code: 'location_description')
      output = service.all_fields custom_form
      expect(output).to include cf1
      expect(output.map(&:code)).to eq %w[
        title_multiloc
        body_multiloc
        author_id
        budget
        proposed_budget
        topic_ids
        location_description
        location_point_geojson
        idea_images_attributes
        idea_files_attributes
      ]
    end
  end

  describe 'configurable_fields' do
    it 'exclude hidden fields' do
      custom_form = create :custom_form
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      hidden_field = create :custom_field, :for_custom_form, resource: custom_form, hidden: true, required: false
      output = service.configurable_fields custom_form
      expect(output).to include title_field
      expect(output).to include extra_field
      expect(output).to include disabled_field
      expect(output).not_to include hidden_field
      expect(output).to include topic_field
      expect(output.map(&:code)).to match_array [
        'title_multiloc',
        'body_multiloc',
        'location_description',
        'idea_images_attributes',
        'idea_files_attributes',
        'proposed_budget',
        'topic_ids',
        nil,
        nil
      ]
    end
  end

  describe 'reportable_fields' do
    it 'exclude disabled and built-in fields' do
      custom_form = create :custom_form
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      hidden_field = create :custom_field, :for_custom_form, resource: custom_form, hidden: true, required: false
      output = service.reportable_fields custom_form
      expect(output).not_to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).to include hidden_field
      expect(output).not_to include topic_field
      expect(output.size).to eq 2
    end
  end

  describe 'visible_fields' do
    it 'exclude disabled and hidden fields' do
      custom_form = create :custom_form
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      hidden_field = create :custom_field, :for_custom_form, resource: custom_form, hidden: true, required: false
      output = service.visible_fields custom_form
      expect(output).to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include hidden_field
      expect(output).not_to include topic_field
      expect(output.map(&:code)).to match_array [
        'title_multiloc',
        'body_multiloc',
        'location_description',
        'idea_images_attributes',
        'idea_files_attributes',
        'author_id',
        'budget',
        nil
      ]
    end
  end

  describe 'extra_visible_fields' do
    it 'exclude disabled, hidden and built-in fields' do
      custom_form = create :custom_form
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      hidden_field = create :custom_field, :for_custom_form, resource: custom_form, hidden: true, required: false
      output = service.extra_visible_fields custom_form
      expect(output).not_to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include hidden_field
      expect(output).not_to include topic_field
      expect(output.map(&:code)).to match_array [nil]
    end
  end
end
