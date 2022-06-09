# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:service) { described_class.new }

  describe '#find_field_by_id' do
    it 'returns nil if the given custom form is nil' do
      expect(service.find_field_by_id(nil, 'some_id')).to be_nil
    end

    it 'returns the field with the given id if the field exists' do
      custom_form = create(:custom_form)
      custom_field = create(:custom_field, resource: custom_form, code: 'title_multiloc')
      expect(service.find_field_by_id(custom_form, custom_field.id)).to eq custom_field
    end

    it 'returns nil if there is no field with the given id' do
      custom_form = create(:custom_form)
      create(:custom_field, resource: custom_form, code: 'title_multiloc')
      expect(service.find_field_by_id(custom_form, 'unknown_id')).to be_nil
    end
  end

  describe '#find_or_build_field' do
    it 'returns nil if the given custom form is nil' do
      expect(service.find_or_build_field(nil, 'some_id')).to be_nil
    end

    it 'returns the default field with the given code if the field is persisted' do
      custom_form = create(:custom_form)
      custom_field = create(:custom_field, resource: custom_form, code: 'title_multiloc')
      expect(service.find_or_build_field(custom_form, custom_field.code)).to eq custom_field
    end

    it 'returns the default field with the given code if the field is not persisted yet' do
      custom_form = create(:custom_form)
      field = service.find_or_build_field(custom_form, 'title_multiloc')
      expect(field.code).to eq 'title_multiloc'
      expect(field.key).to eq 'title_multiloc'
      expect(field.input_type).to eq 'text_multiloc'
    end

    it 'returns nil if there is no default field with the given code' do
      custom_form = create(:custom_form)
      expect(service.find_or_build_field(custom_form, 'unknown_id')).to be_nil
    end
  end

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
        proposed_budget
        topic_ids
        location_description
        idea_images_attributes
        idea_files_attributes
      ]
    end
  end

  describe 'reportable_fields' do
    it 'excludes disabled and built-in fields' do
      custom_form = create :custom_form
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.reportable_fields custom_form
      expect(output).not_to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include topic_field
      expect(output.size).to eq 1
    end
  end

  describe 'visible_fields' do
    it 'excludes disabled fields' do
      custom_form = create :custom_form
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.visible_fields custom_form
      expect(output).to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include topic_field
      expect(output.map(&:code)).to match_array [
        'title_multiloc',
        'body_multiloc',
        'location_description',
        'idea_images_attributes',
        'idea_files_attributes',
        nil
      ]
    end
  end

  describe 'enabled_fields' do
    it 'excludes disabled fields' do
      custom_form = create :custom_form
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.enabled_fields custom_form
      expect(output).to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include topic_field
      expect(output.map(&:code)).to match_array [
        'title_multiloc',
        'body_multiloc',
        'location_description',
        'idea_images_attributes',
        'idea_files_attributes',
        nil
      ]
    end
  end

  describe 'extra_visible_fields' do
    it 'excludes disabled and built-in fields' do
      custom_form = create :custom_form
      title_field = create :custom_field, resource: custom_form, code: 'title_multiloc'
      extra_field = create :custom_field, resource: custom_form, code: nil
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.extra_visible_fields custom_form
      expect(output).not_to include title_field
      expect(output).to include extra_field
      expect(output).not_to include disabled_field
      expect(output).not_to include topic_field
      expect(output.map(&:code)).to match_array [nil]
    end
  end
end
