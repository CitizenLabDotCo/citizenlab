# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:project) { create(:continuous_project, participation_method: 'ideation') }
  let(:service) { described_class.new custom_form }
  let(:participation_context) { Factory.instance.participation_method_for project }

  context 'without persisted fields' do
    let(:custom_form) { create(:custom_form, participation_context: project) }

    describe 'all_fields' do
      it 'outputs valid custom fields' do
        expect(service.all_fields).to all(be_valid)
      end

      it 'returns the built-in fields' do
        output = service.all_fields
        expect(output.map(&:code)).to eq %w[
          ideation_section1
          title_multiloc
          body_multiloc
          ideation_section2
          idea_images_attributes
          idea_files_attributes
          ideation_section3
          topic_ids
          location_description
          proposed_budget
        ]
      end
    end

    describe 'reportable_fields' do
      it 'excludes disabled fields, pages, sections and idea_images_attributes' do
        output = service.reportable_fields
        expect(output.map(&:code)).to eq %w[
          title_multiloc
          body_multiloc
          idea_files_attributes
          topic_ids
          location_description
          proposed_budget
        ]
      end
    end

    describe 'visible_fields' do
      it 'excludes disabled fields' do
        output = service.visible_fields
        expect(output.map(&:code)).to eq %w[
          ideation_section1
          title_multiloc
          body_multiloc
          ideation_section2
          idea_images_attributes
          idea_files_attributes
          ideation_section3
          topic_ids
          location_description
        ]
      end
    end

    describe 'submittable_fields' do
      it 'excludes disabled fields, pages and sections' do
        output = service.submittable_fields
        expect(output.map(&:code)).to eq %w[
          title_multiloc
          body_multiloc
          idea_images_attributes
          idea_files_attributes
          topic_ids
          location_description
        ]
      end
    end

    describe 'enabled_fields' do
      it 'excludes disabled fields' do
        output = service.enabled_fields
        expect(output.map(&:code)).to eq %w[
          ideation_section1
          title_multiloc
          body_multiloc
          ideation_section2
          idea_images_attributes
          idea_files_attributes
          ideation_section3
          topic_ids
          location_description
        ]
      end
    end

    describe 'enabled_public_fields' do
      it 'excludes disabled & answer_visible_to: admins fields' do
        output = service.enabled_public_fields
        expect(output.map(&:code)).to eq %w[
          ideation_section1
          title_multiloc
          body_multiloc
          ideation_section2
          idea_images_attributes
          idea_files_attributes
          ideation_section3
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
    let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
    let!(:extra_field1) { create(:custom_field, resource: custom_form, key: 'extra_field1', enabled: true) }
    let!(:extra_field2) { create(:custom_field, resource: custom_form, key: 'extra_field2', enabled: false) }

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
          'ideation_section1',
          'title_multiloc',
          'body_multiloc',
          'ideation_section2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_section3',
          'topic_ids',
          'proposed_budget',
          nil,
          nil
        ]
      end
    end

    describe 'reportable_fields' do
      it 'excludes disabled fields, pages, sections and idea_images_attributes' do
        topic_field = custom_form.custom_fields.find_by(code: 'topic_ids')
        topic_field.update!(enabled: false)
        custom_form.custom_fields.find_by(code: 'location_description').destroy!

        output = service.reportable_fields
        expect(output.map(&:code)).to eq [
          'title_multiloc',
          'body_multiloc',
          'idea_files_attributes',
          'topic_ids',
          'proposed_budget',
          nil,
          nil
        ]
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
          'ideation_section1',
          'title_multiloc',
          'body_multiloc',
          'ideation_section2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_section3',
          nil
        ]
      end
    end

    describe 'submittable_fields' do
      it 'excludes disabled fields, pages and sections' do
        topic_field = custom_form.custom_fields.find_by(code: 'topic_ids')
        topic_field.update!(enabled: false)
        custom_form.custom_fields.find_by(code: 'location_description').destroy!

        output = service.submittable_fields
        expect(output.map(&:code)).to eq [
          'title_multiloc',
          'body_multiloc',
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
          'ideation_section1',
          'title_multiloc',
          'body_multiloc',
          'ideation_section2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_section3',
          nil
        ]
      end
    end

    describe 'enabled_public_fields' do
      it 'excludes disabled & answer_visible_to: admins fields' do
        location_field = custom_form.custom_fields.find_by(code: 'location_description')
        location_field.update!(answer_visible_to: 'admins')
        output = service.enabled_public_fields
        expect(output.map(&:code)).to eq %w[
          ideation_section1
          title_multiloc
          body_multiloc
          ideation_section2
          idea_images_attributes
          idea_files_attributes
          ideation_section3
          topic_ids
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

    describe 'remove_ignored_update_params' do
      it 'removes code and input_type from params for updating' do
        params = {
          code: 'title_multiloc',
          input_type: 'text_multiloc',
          required: true
        }
        expect(service.remove_ignored_update_params(params)).to match({ required: true })
      end
    end
  end

  context 'constraints/locks on changing attributes' do
    let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

    describe 'validate_constraints_against_defaults' do
      it 'validates if locked attributes are not changed from defaults' do
        title_field = custom_form.custom_fields.find_by(code: 'title_multiloc')
        service.validate_constraints_against_defaults(title_field)

        expect(title_field.errors.errors).to eq []
      end

      it 'only returns 1 error for section 1 even if locked title is different from default' do
        section1_field = custom_form.custom_fields.find_by(code: 'ideation_section1')
        section1_field.enabled = false
        section1_field.title_multiloc = { en: 'Changed value' }
        service.validate_constraints_against_defaults(section1_field)

        expect(section1_field.errors.errors.length).to eq 1
      end

      it 'returns errors if title locked attributes are different from default' do
        title_field = custom_form.custom_fields.find_by(code: 'title_multiloc')
        title_field.enabled = false
        title_field.required = false
        title_field.title_multiloc = { en: 'Changed value' }
        service.validate_constraints_against_defaults(title_field)

        expect(title_field.errors.errors.length).to eq 3
      end

      it 'returns errors if body locked attributes are different from default' do
        body_field = custom_form.custom_fields.find_by(code: 'body_multiloc')
        body_field.enabled = false
        body_field.required = false
        body_field.title_multiloc = { en: 'Changed value' }
        service.validate_constraints_against_defaults(body_field)

        expect(body_field.errors.errors.length).to eq 3
      end

      it 'returns errors if images locked attributes are different from default' do
        images_field = custom_form.custom_fields.find_by(code: 'idea_images_attributes')
        images_field.enabled = false
        images_field.title_multiloc = { en: 'Changed value' }
        service.validate_constraints_against_defaults(images_field)

        expect(images_field.errors.errors.length).to eq 2
      end

      it 'returns errors if files locked attributes are different from default' do
        files_field = custom_form.custom_fields.find_by(code: 'idea_files_attributes')
        files_field.title_multiloc = { en: 'Changed value' }
        service.validate_constraints_against_defaults(files_field)

        expect(files_field.errors.errors.length).to eq 1
      end

      it 'returns errors if topic_ids locked attributes are different from default' do
        topic_ids_field = custom_form.custom_fields.find_by(code: 'topic_ids')
        topic_ids_field.title_multiloc = { en: 'Changed value' }
        service.validate_constraints_against_defaults(topic_ids_field)

        expect(topic_ids_field.errors.errors.length).to eq 1
      end

      it 'returns errors if location locked attributes are different from default' do
        location_field = custom_form.custom_fields.find_by(code: 'location_description')
        location_field.title_multiloc = { en: 'Changed value' }
        service.validate_constraints_against_defaults(location_field)

        expect(location_field.errors.errors.length).to eq 1
      end

      it 'returns errors if proposed budget locked attributes are different from default' do
        proposed_budget_field = custom_form.custom_fields.find_by(code: 'proposed_budget')
        proposed_budget_field.title_multiloc = { en: 'Changed value' }
        service.validate_constraints_against_defaults(proposed_budget_field)

        expect(proposed_budget_field.errors.errors.length).to eq 1
      end
    end

    describe 'validate_constraints_against_updates' do
      it 'validates if locked attributes are not changed' do
        title_field = custom_form.custom_fields.find_by(code: 'title_multiloc')
        valid_params = {
          enabled: title_field.enabled,
          required: title_field.enabled,
          title_multiloc: title_field.title_multiloc
        }
        service.validate_constraints_against_updates(title_field, valid_params)

        expect(title_field.errors.errors).to eq []
      end

      it 'only returns 1 error for section 1 even if locked title is changed' do
        section1_field = custom_form.custom_fields.find_by(code: 'ideation_section1')
        valid_params = { enabled: false, title_multiloc: { en: 'Changed value' } }
        service.validate_constraints_against_updates(section1_field, valid_params)

        expect(section1_field.errors.errors.length).to eq 1
      end

      it 'returns errors if title locked attributes are changed from previous values' do
        title_field = custom_form.custom_fields.find_by(code: 'title_multiloc')
        bad_params = { enabled: false, required: false, title_multiloc: { en: 'Changed value' } }
        service.validate_constraints_against_updates(title_field, bad_params)

        expect(title_field.errors.errors.length).to eq 3
      end

      it 'returns errors if body locked attributes are changed from previous values' do
        body_field = custom_form.custom_fields.find_by(code: 'body_multiloc')
        bad_params = { enabled: false, required: false, title_multiloc: { en: 'Changed value' } }
        service.validate_constraints_against_updates(body_field, bad_params)

        expect(body_field.errors.errors.length).to eq 3
      end

      it 'returns errors if images locked attributes are changed from previous values' do
        images_field = custom_form.custom_fields.find_by(code: 'idea_images_attributes')
        bad_params = { enabled: false, title_multiloc: { en: 'Changed value' } }
        service.validate_constraints_against_updates(images_field, bad_params)

        expect(images_field.errors.errors.length).to eq 2
      end

      it 'returns errors if files locked attributes are changed from previous values' do
        files_field = custom_form.custom_fields.find_by(code: 'idea_files_attributes')
        bad_params = { title_multiloc: { en: 'Changed value' } }
        service.validate_constraints_against_updates(files_field, bad_params)

        expect(files_field.errors.errors.length).to eq 1
      end

      it 'returns errors if topic_ids locked attributes are changed from previous values' do
        topic_ids_field = custom_form.custom_fields.find_by(code: 'topic_ids')
        bad_params = { title_multiloc: { en: 'Changed value' } }
        service.validate_constraints_against_updates(topic_ids_field, bad_params)

        expect(topic_ids_field.errors.errors.length).to eq 1
      end

      it 'returns errors if location locked attributes are changed from previous values' do
        location_field = custom_form.custom_fields.find_by(code: 'location_description')
        bad_params = { title_multiloc: { en: 'Changed value' } }
        service.validate_constraints_against_updates(location_field, bad_params)

        expect(location_field.errors.errors.length).to eq 1
      end

      it 'returns errors if proposed budget locked attributes are changed from previous values' do
        proposed_budget_field = custom_form.custom_fields.find_by(code: 'proposed_budget')
        bad_params = { title_multiloc: { en: 'Changed value' } }
        service.validate_constraints_against_updates(proposed_budget_field, bad_params)

        expect(proposed_budget_field.errors.errors.length).to eq 1
      end
    end
  end

  context 'validate form structure' do
    describe 'ideation form' do
      let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

      it 'returns no errors if the form has a section field as the first element' do
        fields = service.all_fields
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 0
      end

      it 'returns no errors if the form has no fields' do
        fields = []
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 0
      end

      it 'returns errors if the first field is not a section' do
        fields = service.all_fields
        fields.delete(fields.find_by(code: 'ideation_section1'))
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 1
      end

      it 'returns errors if form includes any page fields' do
        create(:custom_field_page, resource: custom_form, key: 'a_page')
        fields = service.all_fields
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 1
      end
    end

    describe 'survey form' do
      let(:survey_project) { create(:continuous_project, participation_method: 'native_survey') }
      let(:custom_form) { create(:custom_form, participation_context: survey_project) }

      it 'returns no errors if the form has a page field as the first element' do
        create(:custom_field_page, resource: custom_form, key: 'a_page')
        fields = service.all_fields
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 0
      end

      it 'returns errors if the first field is not a page' do
        create(:custom_field, resource: custom_form, key: 'not_a_page')
        create(:custom_field_page, resource: custom_form, key: 'a_page')
        fields = service.all_fields
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 1
        expect(errors['0']).not_to be_nil
      end

      it 'returns errors if form includes any section fields' do
        create(:custom_field_page, resource: custom_form, key: 'a_page')
        create(:custom_field_section, resource: custom_form, key: 'a_section')
        fields = service.all_fields
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 1
        expect(errors['1']).not_to be_nil
      end
    end
  end
end
