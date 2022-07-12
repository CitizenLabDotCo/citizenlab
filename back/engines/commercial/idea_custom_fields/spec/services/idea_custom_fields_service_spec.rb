# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:custom_form) { create(:custom_form) }
  let(:service) { described_class.new custom_form }

  describe '#find_field_by_id' do
    context 'when the custom form is nil' do
      let(:custom_form) { nil }

      it 'returns nil' do
        expect(service.find_field_by_id('some_id')).to be_nil
      end
    end

    it 'returns the field with the given id if the field exists' do
      custom_field = create(:custom_field, resource: custom_form, code: 'title_multiloc')
      expect(service.find_field_by_id(custom_field.id)).to eq custom_field
    end

    it 'returns nil if there is no field with the given id' do
      create(:custom_field, resource: custom_form, code: 'title_multiloc')
      expect(service.find_field_by_id('unknown_id')).to be_nil
    end
  end

  describe '#find_or_build_field' do
    context 'when the custom form is nil' do
      let(:custom_form) { nil }

      it 'returns nil' do
        expect(service.find_or_build_field('some_id')).to be_nil
      end
    end

    it 'returns the default field with the given code if the field is persisted' do
      custom_field = create(:custom_field, resource: custom_form, code: 'title_multiloc')
      expect(service.find_or_build_field(custom_field.code)).to eq custom_field
    end

    it 'returns the default field with the given code if the field is not persisted yet' do
      field = service.find_or_build_field('title_multiloc')
      expect(field.code).to eq 'title_multiloc'
      expect(field.key).to eq 'title_multiloc'
      expect(field.input_type).to eq 'text_multiloc'
    end

    it 'returns nil if there is no default field with the given code' do
      expect(service.find_or_build_field('unknown_id')).to be_nil
    end
  end

  describe 'all_fields' do
    it 'overrides built in custom fields with database custom fields by code' do
      cf1 = create(:custom_field, resource: custom_form, code: 'title_multiloc')
      cf2 = create(:custom_field, resource: custom_form, code: nil)
      topic_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, code: 'topic_ids'
      disabled_field = create :custom_field, :for_custom_form, resource: custom_form, enabled: false, required: true
      output = service.all_fields
      expect(output).to include cf1
      expect(output).to include cf2
      expect(output).to include disabled_field
      expect(output).to include topic_field
      expect(output.map(&:code)).to eq [
        'title_multiloc',
        'body_multiloc',
        'author_id',
        'budget',
        'proposed_budget',
        'topic_ids',
        'location_description',
        'idea_images_attributes',
        'idea_files_attributes',
        nil,
        nil
      ]
    end

    it 'outputs valid custom fields' do
      expect(service.all_fields).to all(be_valid)
    end

    it 'returns the fields in the correct order' do
      create :custom_field, resource: custom_form, key: 'extra_field1'
      create :custom_field, resource: custom_form, code: 'location_description', key: 'location_description', required: true
      create :custom_field, resource: custom_form, key: 'extra_field2'
      create :custom_field, resource: custom_form, code: 'proposed_budget', key: 'proposed_budget', required: true
      output = service.all_fields
      expect(output.map(&:key)).to eq %w[
        title_multiloc
        body_multiloc
        author_id
        budget
        proposed_budget
        topic_ids
        location_description
        idea_images_attributes
        idea_files_attributes
        extra_field1
        extra_field2
      ]
    end

    it 'only returns default fields when there is no custom form' do
      custom_form.destroy!
      service = described_class.new nil
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
