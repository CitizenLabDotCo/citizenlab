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
          title_page
          title_multiloc
          body_page
          body_multiloc
          uploads_page
          idea_images_attributes
          idea_files_attributes
          details_page
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
          title_page
          title_multiloc
          body_page
          body_multiloc
          uploads_page
          idea_images_attributes
          idea_files_attributes
          details_page
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
          title_page
          title_multiloc
          body_page
          body_multiloc
          uploads_page
          idea_images_attributes
          idea_files_attributes
          details_page
          topic_ids
          location_description
        ]
      end
    end

    describe 'enabled_public_fields' do
      it 'excludes disabled & answer_visible_to: admins fields' do
        output = service.enabled_public_fields
        expect(output.map(&:code)).to eq [
          'title_page',
          'title_multiloc',
          'body_page',
          'body_multiloc',
          'uploads_page',
          'idea_images_attributes',
          'idea_files_attributes',
          'details_page',
          'topic_ids',
          'location_description',
          nil
        ]
      end
    end

    describe 'extra_visible_fields' do
      it 'excludes disabled and built-in fields' do
        output = service.extra_visible_fields
        expect(output.size).to eq 1
      end
    end

    describe 'survey_results_fields' do
      context 'commmunity monitor survey' do
        let(:custom_form) do
          phase = create(:community_monitor_survey_phase, with_permissions: true)
          phase.pmethod.create_default_form!
          phase.custom_form.custom_fields[2].update!(question_category: 'governance_and_trust')
          phase.custom_form.custom_fields[3].update!(question_category: nil)
          phase.custom_form
        end

        it 'returns fields structured as per the survey form' do
          output = service.survey_results_fields
          expect(output.pluck(:input_type)).to eq %w[
            page sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text
            page sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text
            page sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text
            page
          ]
          expect(output.pluck(:key)).to eq %w[
            page_quality_of_life place_to_live place_to_live_follow_up sense_of_safety sense_of_safety_follow_up access_to_parks access_to_parks_follow_up affordable_housing affordable_housing_follow_up employment_opportunities employment_opportunities_follow_up
            page_service_delivery quality_of_services quality_of_services_follow_up overall_value overall_value_follow_up cleanliness_and_maintenance cleanliness_and_maintenance_follow_up
            page_governance_and_trust trust_in_government trust_in_government_follow_up responsiveness_of_officials responsiveness_of_officials_follow_up transparency_of_money_spent transparency_of_money_spent_follow_up
            form_end
          ]
        end

        it 'returns fields with categories as pages' do
          output = service.survey_results_fields(structure_by_category: true)
          expect(output.pluck(:input_type)).to eq %w[
            page sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text
            page sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text
            page sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text sentiment_linear_scale multiline_text
            page sentiment_linear_scale multiline_text
          ]
          expect(output.pluck(:key)).to eq %w[
            category_quality_of_life place_to_live place_to_live_follow_up affordable_housing affordable_housing_follow_up employment_opportunities employment_opportunities_follow_up
            category_service_delivery quality_of_services quality_of_services_follow_up overall_value overall_value_follow_up cleanliness_and_maintenance cleanliness_and_maintenance_follow_up
            category_governance_and_trust sense_of_safety sense_of_safety_follow_up trust_in_government trust_in_government_follow_up responsiveness_of_officials responsiveness_of_officials_follow_up transparency_of_money_spent transparency_of_money_spent_follow_up
            category_other access_to_parks access_to_parks_follow_up
          ]
        end
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
          'title_page',
          'title_multiloc',
          'body_page',
          'body_multiloc',
          'uploads_page',
          'idea_images_attributes',
          'idea_files_attributes',
          'details_page',
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
          'title_page',
          'title_multiloc',
          'body_page',
          'body_multiloc',
          'uploads_page',
          'idea_images_attributes',
          'idea_files_attributes',
          'details_page',
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
          'title_page',
          'title_multiloc',
          'body_page',
          'body_multiloc',
          'uploads_page',
          'idea_images_attributes',
          'idea_files_attributes',
          'details_page',
          nil,
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

  context 'survey form with user fields' do
    describe 'enabled_fields' do
      let!(:custom_form) { create(:custom_form, participation_context: form_context) }

      # Survey fields
      let!(:page_field) { create(:custom_field_page, resource: custom_form, key: 'page1') }
      let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'text_field') }
      let!(:end_page_field) { create(:custom_field_page, resource: custom_form, key: 'form_end') }

      # Define some user fields
      let!(:user_field_gender) { create(:custom_field_gender) }
      let!(:user_field_birthyear) { create(:custom_field_birthyear) }

      context 'when phase is a native survey phase' do
        let(:form_context) do
          phase = create(:native_survey_phase, with_permissions: true)
          phase.permissions.find_by(action: 'posting_idea').update!(user_fields_in_form: true)
          phase
        end

        it 'returns form fields with an additional page of demographics' do
          output = service.enabled_fields
          expect(output.pluck(:key)).to eq %w[
            page1
            text_field
            user_page
            u_gender
            u_birthyear
            form_end
          ]
        end
      end

      context 'when phase is an ideation phase' do
        let(:form_context) { create(:project) }

        it 'returns only idea fields' do
          output = service.enabled_fields
          expect(output.pluck(:key)).to eq %w[
            page1
            text_field
            form_end
          ]
        end
      end
    end
  end

  describe '#duplicate_all_fields' do
    let(:survey_project) { create(:single_phase_native_survey_project) }
    let(:custom_form) { create(:custom_form, participation_context: survey_project.phases.first) }

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
