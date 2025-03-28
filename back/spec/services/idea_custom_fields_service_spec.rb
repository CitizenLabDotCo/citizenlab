# frozen_string_literal: true

require 'rails_helper'

describe IdeaCustomFieldsService do
  let(:project) { create(:single_phase_ideation_project) }
  let(:service) { described_class.new custom_form }
  let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }

  context 'without persisted fields' do
    let(:custom_form) { create(:custom_form, participation_context: project) }

    describe 'all_fields' do
      it 'outputs valid custom fields' do
        expect(service.all_fields).to all(be_valid)
      end

      it 'returns the built-in fields' do
        output = service.all_fields
        expect(output.filter_map(&:code)).to eq %w[
          ideation_page1
          title_multiloc
          body_multiloc
          ideation_page2
          idea_images_attributes
          idea_files_attributes
          ideation_page3
          topic_ids
          location_description
          proposed_budget
        ]
      end
    end

    describe 'visible_fields' do
      it 'excludes disabled fields' do
        output = service.visible_fields
        expect(output.filter_map(&:code)).to eq %w[
          ideation_page1
          title_multiloc
          body_multiloc
          ideation_page2
          idea_images_attributes
          idea_files_attributes
          ideation_page3
          topic_ids
          location_description
        ]
      end
    end

    describe 'submittable_fields' do
      it 'excludes disabled fields and pages' do
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
        expect(output.filter_map(&:code)).to eq %w[
          ideation_page1
          title_multiloc
          body_multiloc
          ideation_page2
          idea_images_attributes
          idea_files_attributes
          ideation_page3
          topic_ids
          location_description
        ]
      end
    end

    describe 'enabled_public_fields' do
      it 'excludes disabled & answer_visible_to: admins fields' do
        output = service.enabled_public_fields
        expect(output.map(&:code)).to eq %w[
          ideation_page1
          title_multiloc
          body_multiloc
          ideation_page2
          idea_images_attributes
          idea_files_attributes
          ideation_page3
          topic_ids
          location_description
        ]
      end
    end

    describe 'extra_visible_fields' do
      it 'excludes disabled and built-in fields' do
        output = service.extra_visible_fields
        expect(output.size).to eq 1
      end
    end
  end

  context 'with persisted fields' do
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
          'ideation_page1',
          'title_multiloc',
          'body_multiloc',
          'ideation_page2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_page3',
          'topic_ids',
          'proposed_budget',
          nil,
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
          'ideation_page1',
          'title_multiloc',
          'body_multiloc',
          'ideation_page2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_page3',
          nil,
          nil
        ]
      end
    end

    describe 'submittable_fields' do
      it 'excludes disabled fields and pages' do
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
          'ideation_page1',
          'title_multiloc',
          'body_multiloc',
          'ideation_page2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_page3',
          nil,
          nil
        ]
      end
    end

    describe 'enabled_public_fields' do
      it 'excludes disabled & answer_visible_to: admins fields' do
        location_field = custom_form.custom_fields.find_by(code: 'location_description')
        location_field.update!(answer_visible_to: 'admins')
        output = service.enabled_public_fields
        expect(output.map(&:code)).to eq [
          'ideation_page1',
          'title_multiloc',
          'body_multiloc',
          'ideation_page2',
          'idea_images_attributes',
          'idea_files_attributes',
          'ideation_page3',
          'topic_ids',
          nil
        ]
      end
    end

    describe 'extra_visible_fields' do
      it 'excludes disabled and built-in fields' do
        output = service.extra_visible_fields
        expect(output).to include extra_field1
        expect(output).not_to include extra_field2
        expect(output.map(&:code)).to eq [nil, nil]
      end
    end
  end

  context 'copying fields' do
    describe '#duplicate_all_fields' do
      let(:project) { create(:single_phase_native_survey_project) }
      let(:custom_form) { create(:custom_form, participation_context: project) }

      it 'creates non-persisted duplicates of all fields' do
        page1 = create(:custom_field_page, resource: custom_form)
        select_field = create(:custom_field_select, resource: custom_form)
        select_option = create(:custom_field_option, custom_field: select_field)
        page2 = create(:custom_field_page, resource: custom_form)
        text_field = create(:custom_field_text, resource: custom_form)
        matrix_field = create(:custom_field_matrix_linear_scale, resource: custom_form)
        page3 = create(:custom_field_page, resource: custom_form)
        multi_select_field = create(:custom_field_multiselect, resource: custom_form)
        _multi_select_option = create(:custom_field_option, custom_field: multi_select_field)
        map_field = create(:custom_field_point, resource: custom_form, map_config: create(:map_config))
        map_field_no_config = create(:custom_field_point, resource: custom_form)
        select_field.update!(logic: { rules: [{ if: select_option.id, goto_page_id: page3.id }] })
        page2.update!(logic: { next_page_id: page3.id })

        expect(CustomField.count).to eq 9
        expect(CustomMaps::MapConfig.count).to eq 1

        fields = service.duplicate_all_fields

        expect(CustomField.count).to eq 9
        expect(CustomMaps::MapConfig.count).to eq 2
        expect(fields.count).to eq 9

        # page 1
        expect(fields[0].id).not_to eq page1.id

        # select field
        expect(fields[1].id).not_to eq select_field.id
        expect(fields[1].logic).to match({
          'rules' => [
            { 'if' => fields[1].options[0].temp_id, 'goto_page_id' => fields[5].id }
          ]
        })
        expect(fields[1].options[0].temp_id).to match 'TEMP-ID-'

        # page 2
        expect(fields[2].id).not_to eq page2.id
        expect(fields[2].logic).to match({
          'next_page_id' => fields[5].id
        })

        # text field
        expect(fields[3].id).not_to eq text_field.id

        # matrix field
        expect(fields[4].id).not_to eq matrix_field.id
        expect(fields[4].matrix_statements[0].id).not_to eq matrix_field.matrix_statements[0].id
        expect(fields[4].matrix_statements.map(&:key)).to eq matrix_field.matrix_statements.map(&:key)

        # page 3
        expect(fields[5].id).not_to eq page3.id

        # multi select field
        expect(fields[6].id).not_to eq multi_select_field.id
        expect(fields[6].options[0].temp_id).to match 'TEMP-ID-'

        # map field - duplicates map config
        expect(fields[7].id).not_to eq map_field.id
        expect(fields[7].map_config.id).not_to eq map_field.map_config.id

        # map field 2 - has no map config
        expect(fields[8].id).not_to eq map_field_no_config.id
        expect(fields[8].map_config).to be_nil
      end
    end
  end

  context 'constraints/locks on changing attributes' do
    describe 'validate_constraints_against_defaults' do
      it 'validates if locked attributes are not changed from defaults' do
        title_field = custom_form.custom_fields.find_by(code: 'title_multiloc')
        service.validate_constraints_against_defaults(title_field)

        expect(title_field.errors.errors).to eq []
      end

      it 'only returns 1 error for page 1 even if locked title is different from default' do
        page1_field = custom_form.custom_fields.find_by(code: 'ideation_page1')
        page1_field.enabled = false
        page1_field.title_multiloc = { en: 'Changed value' }
        service.validate_constraints_against_defaults(page1_field)

        expect(page1_field.errors.errors.length).to eq 1
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

      it 'only returns 1 error for page 1 even if locked title is changed' do
        page1_field = custom_form.custom_fields.find_by(code: 'ideation_page1')
        valid_params = { enabled: false, title_multiloc: { en: 'Changed value' } }
        service.validate_constraints_against_updates(page1_field, valid_params)

        expect(page1_field.errors.errors.length).to eq 1
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

  context 'form validation' do
    describe '#check_form_structure' do
      it 'returns no errors if the form has no fields' do
        fields = []
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 0
      end

      it 'returns no errors if the form from params has a page field as the first element' do
        fields = [
          { input_type: 'page' },
          { input_type: 'page', key: 'form_end' }
        ]
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 0
      end

      it 'returns errors if the first field is not a page' do
        fields = [
          { input_type: 'text' },
          { input_type: 'page', key: 'form_end' }
        ]
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 1
        expect(errors['0']).not_to be_nil
        expect(errors.dig('0', :structure, 0, :error)).to eq "First field must be of type 'page'"
      end

      it 'returns errors if the last field is not a page with the key "form_end"' do
        fields = [
          { input_type: 'page' },
          { input_type: 'page' }
        ]
        errors = {}
        service.check_form_structure(fields, errors)

        expect(errors.length).to eq 1
        expect(errors.dig('1', :structure, 0, :error)).to eq "Last field must be of type 'page' with a key of 'form_end'"
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
end
