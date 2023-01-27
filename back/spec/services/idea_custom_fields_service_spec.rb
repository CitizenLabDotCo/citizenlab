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
          ideation_section_1
          title_multiloc
          body_multiloc
          ideation_section_2
          idea_images_attributes
          idea_files_attributes
          ideation_section_3
          topic_ids
          location_description
          proposed_budget
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
          ideation_section_1
          title_multiloc
          body_multiloc
          ideation_section_2
          idea_images_attributes
          idea_files_attributes
          ideation_section_3
          topic_ids
          location_description
        ]
      end
    end

    describe 'enabled_fields' do
      it 'excludes disabled fields' do
        output = service.enabled_fields
        expect(output.map(&:code)).to eq %w[
          ideation_section_1
          title_multiloc
          body_multiloc
          ideation_section_2
          idea_images_attributes
          idea_files_attributes
          ideation_section_3
          topic_ids
          location_description
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
          'ideation_section_1',
          'title_multiloc',
          'body_multiloc',
          'ideation_section_2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_section_3',
          'topic_ids',
          'proposed_budget',
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
          'ideation_section_1',
          'title_multiloc',
          'body_multiloc',
          'ideation_section_2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_section_3',
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
          'ideation_section_1',
          'title_multiloc',
          'body_multiloc',
          'ideation_section_2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_section_3',
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

    describe 'constraints whilst updating persisted fields' do
      it 'validates if locked attributes are not changed' do
        title_field = custom_form.custom_fields.find_by(code: 'title_multiloc')
        valid_params = {
          enabled: title_field.enabled,
          required: title_field.enabled,
          title_multiloc: title_field.title_multiloc
        }
        service.validate_update_constraints(title_field, valid_params)

        expect(title_field.errors.errors).to eq []
      end

      it 'returns errors if locked values are changed from previous values' do
        title_field = custom_form.custom_fields.find_by(code: 'title_multiloc')
        bad_params = {
          enabled: false,
          required: false,
          title_multiloc: { en: 'Bad value' }
        }
        service.validate_update_constraints(title_field, bad_params)

        expect(title_field.errors.errors.length).to eq 3
      end

      # it 'does not return errors if locked title of section 1 is changed' do
      #   bad_title = { en: 'Bad value' }
      #   field = described_class.new(
      #     resource: form,
      #     input_type: 'section',
      #     code: 'ideation_section_1',
      #     key: 'ideation_section_1',
      #     title_multiloc: bad_title, # locked to default value
      #     enabled: true # locked to true
      #   )
      #
      #   expect(field.save).to be true
      # end
    end
  end
end
