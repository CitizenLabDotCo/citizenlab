# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:project) { create :continuous_project, participation_method: 'ideation' }
  let(:service) { described_class.new custom_form }
  let(:participation_context) { Factory.instance.participation_method_for project }

  context 'without persisted fields' do
    let(:custom_form) { create :custom_form, participation_context: project }

    describe 'all_fields' do
      it 'outputs valid custom fields' do
        expect(service.all_fields).to all(be_valid)
      end

      it 'returns the built-in fields' do
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

    describe 'reportable_fields' do
      it 'excludes disabled and built-in fields' do
        output = service.reportable_fields
        expect(output).to be_empty
      end
    end

    describe 'visible_fields' do
      it 'excludes disabled fields' do
        output = service.visible_fields
        expect(output.map(&:code)).to eq %w[
          title_multiloc
          body_multiloc
          author_id
          budget
          topic_ids
          location_description
          idea_images_attributes
          idea_files_attributes
        ]
      end
    end

    describe 'enabled_fields' do
      it 'excludes disabled fields' do
        output = service.enabled_fields
        expect(output.map(&:code)).to eq %w[
          title_multiloc
          body_multiloc
          author_id
          budget
          topic_ids
          location_description
          idea_images_attributes
          idea_files_attributes
        ]
      end
    end

    describe 'extra_visible_fields' do
      it 'excludes disabled and built-in fields' do
        output = service.extra_visible_fields
        expect(output).to be_empty
      end
    end

    describe 'allowed_extra_field_keys' do
      it 'excludes disabled and built-in field keys' do
        output = service.allowed_extra_field_keys
        expect(output).to be_empty
      end
    end
  end

  context 'with persisted fields' do
    let(:custom_form) { create :custom_form, :with_default_fields, participation_context: project }
    let!(:extra_field1) { create :custom_field, resource: custom_form, key: 'extra_field1', enabled: true }
    let!(:extra_field2) { create :custom_field, resource: custom_form, key: 'extra_field2', enabled: false }

    describe 'all_fields' do
      it 'outputs valid custom fields' do
        expect(service.all_fields).to all(be_valid)
      end

      it 'returns persisted fields' do
        topic_field = custom_form.custom_fields.find_by(code: 'topic_ids')
        topic_field.update!(enabled: false)
        custom_form.custom_fields.find_by(code: 'location_description').destroy!

        output = service.all_fields
        expect(output).to include extra_field1
        expect(output).to include extra_field2
        expect(output).to include topic_field
        expect(output.map(&:code)).to eq [
          'title_multiloc',
          'body_multiloc',
          'author_id',
          'budget',
          'proposed_budget',
          'topic_ids',
          'idea_images_attributes',
          'idea_files_attributes',
          nil,
          nil
        ]
      end
    end

    describe 'configurable_fields' do
      it 'returns all fields except author_id and budget' do
        topic_field = custom_form.custom_fields.find_by(code: 'topic_ids')
        topic_field.update!(enabled: false)
        custom_form.custom_fields.find_by(code: 'location_description').destroy!

        output = service.configurable_fields
        expect(output).to include extra_field1
        expect(output).to include extra_field2
        expect(output).to include topic_field
        expect(output.map(&:code)).to eq [
          'title_multiloc',
          'body_multiloc',
          'proposed_budget',
          'topic_ids',
          'idea_images_attributes',
          'idea_files_attributes',
          nil,
          nil
        ]
      end
    end

    describe 'reportable_fields' do
      it 'excludes disabled and built-in fields' do
        output = service.reportable_fields
        expect(output).to include extra_field1
        expect(output).not_to include extra_field2
        expect(output.map(&:code)).to eq [nil]
      end
    end

    describe 'visible_fields' do
      it 'excludes disabled fields' do
        topic_field = custom_form.custom_fields.find_by(code: 'topic_ids')
        topic_field.update!(enabled: false)
        custom_form.custom_fields.find_by(code: 'location_description').destroy!

        output = service.visible_fields
        expect(output).to include extra_field1
        expect(output).not_to include extra_field2
        expect(output).not_to include topic_field
        expect(output.map(&:code)).to eq [
          'title_multiloc',
          'body_multiloc',
          'author_id',
          'budget',
          'idea_images_attributes',
          'idea_files_attributes',
          nil
        ]
      end
    end

    describe 'enabled_fields' do
      it 'excludes disabled fields' do
        topic_field = custom_form.custom_fields.find_by(code: 'topic_ids')
        topic_field.update!(enabled: false)
        custom_form.custom_fields.find_by(code: 'location_description').destroy!

        output = service.enabled_fields
        expect(output).to include extra_field1
        expect(output).not_to include extra_field2
        expect(output).not_to include topic_field
        expect(output.map(&:code)).to eq [
          'title_multiloc',
          'body_multiloc',
          'author_id',
          'budget',
          'idea_images_attributes',
          'idea_files_attributes',
          nil
        ]
      end
    end

    describe 'extra_visible_fields' do
      it 'excludes disabled and built-in fields' do
        output = service.extra_visible_fields
        expect(output).to include extra_field1
        expect(output).not_to include extra_field2
        expect(output.map(&:code)).to eq [nil]
      end
    end

    describe 'allowed_extra_field_keys' do
      it 'excludes disabled and built-in field keys' do
        create(
          :custom_field_multiselect,
          :for_custom_form,
          resource: custom_form,
          required: false,
          key: 'multiselect_field'
        )

        output = service.allowed_extra_field_keys
        expect(output).to match_array [:extra_field1, { multiselect_field: [] }]
      end
    end
  end
end
