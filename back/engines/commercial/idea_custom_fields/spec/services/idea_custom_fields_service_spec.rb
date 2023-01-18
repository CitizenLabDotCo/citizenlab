# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:project) { create :continuous_project, participation_method: 'ideation' }
  let(:custom_form) { create :custom_form, participation_context: project }
  let(:service) { described_class.new custom_form }
  let(:participation_context) { Factory.instance.participation_method_for project }

  describe 'configurable_fields' do
    it 'returns all fields except author_id and budget' do
      create :custom_field, resource: custom_form, key: 'extra_field1', enabled: true
      create :custom_field, resource: custom_form, key: 'extra_field2', enabled: false
      output = service.configurable_fields
      expect(output.map(&:key)).to eq %w[
        title_multiloc
        body_multiloc
        proposed_budget
        topic_ids
        location_description
        idea_images_attributes
        idea_files_attributes
        extra_field1
        extra_field2
      ]
    end
  end

  describe 'reportable_fields' do
    it 'excludes disabled and built-in fields' do
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.reportable_fields
      expect(output).not_to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include topic_field
      expect(output.size).to eq 1
    end
  end

  describe 'visible_fields' do
    it 'excludes disabled fields' do
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.visible_fields
      expect(output).to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include topic_field
      expect(output.map(&:code)).to eq [
        'title_multiloc',
        'body_multiloc',
        'author_id',
        'budget',
        'location_description',
        'idea_images_attributes',
        'idea_files_attributes',
        nil
      ]
    end
  end

  describe 'enabled_fields' do
    it 'excludes disabled fields' do
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.enabled_fields
      expect(output).to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include topic_field
      expect(output.map(&:code)).to eq [
        'title_multiloc',
        'body_multiloc',
        'author_id',
        'budget',
        'location_description',
        'idea_images_attributes',
        'idea_files_attributes',
        nil
      ]
    end
  end

  describe 'extra_visible_fields' do
    it 'excludes disabled and built-in fields' do
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.extra_visible_fields
      expect(output).not_to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include topic_field
      expect(output.map(&:code)).to eq [nil]
    end
  end
end
