# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Inputs posted by residents: native survey responses.'

  let(:user) { create(:user) }

  before do
    header 'Content-Type', 'application/json'
    header_token_for user
    create(:idea_status_proposed)
  end

  get 'web_api/v1/ideas/:id' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:creation_phase) { project.phases.first }
    let!(:input) do
      create(
        :idea,
        author: user,
        project: project,
        creation_phase: creation_phase,
        phases: [creation_phase]
      )
    end
    let(:id) { input.id }

    example_request '[error] Try to get one input by id' do
      assert_status 200
      expect(response_data[:id]).to eq(input.id)
    end
  end

  get 'web_api/v1/ideas/by_slug/:slug' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:creation_phase) { project.phases.first }
    let!(:input) do
      create(
        :idea,
        author: user,
        project: project,
        creation_phase: creation_phase,
        phases: [creation_phase]
      )
    end
    let(:slug) { input.slug }

    example_request 'Get one input by slug' do
      assert_status 200
      expect(response_data[:id]).to eq(input.id)
    end
  end

  post 'web_api/v1/ideas' do
    with_options scope: :idea do
      parameter :project_id, 'The identifier of the project that hosts the input', required: true
      parameter :phase_ids, 'The identifiers of the phases that host the input. None is allowed for normal users.', required: false
      parameter :custom_field_name1, 'A value for one custom field'
      parameter :custom_field_name2, 'A value for another custom field'
      parameter :custom_field_name2_other, 'A custom text value for an "other" option in custom fields'
      parameter :custom_field_name3, 'A value for another custom field'
      parameter :custom_field_name3_other, 'A custom text value for an "other" option in custom fields'
      parameter :publication_status, 'Draft or published', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Idea)

    context 'when phase_ids are not given' do
      let(:phase_ids) { [] }
      let(:project_id) { project.id }

      context 'with two file upload fields' do
        # Note the "notwhitelisted" file extension. It is here to validate
        # that no file extension validation is done.
        let(:filename1) { 'afvalkalender2022.notwhitelisted' }
        let(:filename2) { 'afvalkalender2023.pdf' }
        let(:fixture_filename) { 'afvalkalender.pdf' }
        let(:fixture_mime_type) { 'application/pdf' }
        let(:file_contents1) { file_as_base64(fixture_filename, fixture_mime_type) }
        let(:file_contents2) { file_as_base64(fixture_filename, fixture_mime_type) }
        let!(:files_field1) do
          create(
            :custom_field,
            resource: custom_form,
            input_type: 'file_upload',
            key: 'custom_field_name1',
            enabled: true,
            title_multiloc: { 'en' => 'Please upload a plan' }
          )
        end
        let!(:files_field2) do
          create(
            :custom_field,
            resource: custom_form,
            input_type: 'file_upload',
            key: 'custom_field_name2',
            enabled: true,
            title_multiloc: { 'en' => 'Please upload another plan' }
          )
        end
        let(:custom_field_name1) do
          {
            content: file_contents1,
            name: filename1
          }
        end
        let(:custom_field_name2) do
          {
            content: file_contents2,
            name: filename2
          }
        end
        let(:project) { create(:single_phase_native_survey_project) }
        let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }

        context 'published idea' do
          example_request 'Create a survey response with file upload fields' do
            assert_status 201
            expect(json_response_body.dig(:data, :relationships, :project, :data, :id)).to eq project_id

            # Verify that the input is saved correctly
            inputs = project.reload.ideas
            expect(inputs.size).to eq 1
            input = inputs.first
            expect(input.phase_ids).to eq [project.phases.first.id]
            expect(input.creation_phase).to eq project.phases.first

            # Verify that the files are saved correctly
            file1_id = input.custom_field_values['custom_field_name1']['id']
            file2_id = input.custom_field_values['custom_field_name2']['id']
            file1 = IdeaFile.find(file1_id)
            file2 = IdeaFile.find(file2_id)
            expect(input.idea_files.size).to eq 2
            expect(input.idea_files.ids).to match_array([file1.id, file2.id])
            expect(file1.name).to eq filename1
            expect(file1.file.url).to match "/uploads/.+/idea_file/file/#{file1.id}/#{filename1}"
            expect(file2.name).to eq filename2
            expect(file2.file.url).to match "/uploads/.+/idea_file/file/#{file2.id}/#{filename2}"

            # Verify that the custom field value is saved correctly.
            expect(input.custom_field_values).to eq({
              'custom_field_name1' => { 'id' => file1.id, 'name' => file1.name },
              'custom_field_name2' => { 'id' => file2.id, 'name' => file2.name }
            })
          end
        end

        context 'draft idea' do
          let(:publication_status) { 'draft' }

          example_request 'Create a draft survey response with a file upload field' do
            assert_status 201
            survey = project.reload.ideas.first
            expect(survey.publication_status).to eq 'draft'
            expect(survey.custom_field_values.values).to match_array(
              IdeaFile.all.map { |file| { 'id' => file.id, 'name' => file.name } }
            )
          end
        end
      end

      context 'with two shapefile upload fields' do
        # Note the "notwhitelisted" file extension. It is here to validate
        # that no file extension validation is done.
        let(:filename1) { 'afvalkalender2022.notwhitelisted' }
        let(:filename2) { 'afvalkalender2023.pdf' }
        let(:fixture_filename) { 'afvalkalender.pdf' }
        let(:fixture_mime_type) { 'application/pdf' }
        let(:file_contents1) { file_as_base64(fixture_filename, fixture_mime_type) }
        let(:file_contents2) { file_as_base64(fixture_filename, fixture_mime_type) }
        let!(:files_field1) do
          create(
            :custom_field,
            resource: custom_form,
            input_type: 'shapefile_upload',
            key: 'custom_field_name1',
            enabled: true,
            title_multiloc: { 'en' => 'Please upload a zipfile containing shapefile(s)' }
          )
        end
        let!(:files_field2) do
          create(
            :custom_field,
            resource: custom_form,
            input_type: 'shapefile_upload',
            key: 'custom_field_name2',
            enabled: true,
            title_multiloc: { 'en' => 'Please upload another zipfile containing shapefile(s)' }
          )
        end
        let(:custom_field_name1) do
          {
            content: file_contents1,
            name: filename1
          }
        end
        let(:custom_field_name2) do
          {
            content: file_contents2,
            name: filename2
          }
        end
        let(:project) { create(:single_phase_native_survey_project) }
        let(:custom_form) { create(:custom_form, participation_context: project.phases.first) }

        context 'published idea' do
          example_request 'Create a survey response with shapefile upload fields' do
            assert_status 201
            expect(json_response_body.dig(:data, :relationships, :project, :data, :id)).to eq project_id

            # Verify that the input is saved correctly
            inputs = project.reload.ideas
            expect(inputs.size).to eq 1
            input = inputs.first
            expect(input.phase_ids).to eq [project.phases.first.id]
            expect(input.creation_phase).to eq project.phases.first

            # Verify that the files are saved correctly
            file1_id = input.custom_field_values['custom_field_name1']['id']
            file2_id = input.custom_field_values['custom_field_name2']['id']
            file1 = IdeaFile.find(file1_id)
            file2 = IdeaFile.find(file2_id)
            expect(input.idea_files.size).to eq 2
            expect(input.idea_files.ids).to match_array([file1.id, file2.id])
            expect(file1.name).to eq filename1
            expect(file1.file.url).to match "/uploads/.+/idea_file/file/#{file1.id}/#{filename1}"
            expect(file2.name).to eq filename2
            expect(file2.file.url).to match "/uploads/.+/idea_file/file/#{file2.id}/#{filename2}"

            # Verify that the custom field value is saved correctly.
            expect(input.custom_field_values).to eq({
              'custom_field_name1' => { 'id' => file1.id, 'name' => file1.name },
              'custom_field_name2' => { 'id' => file2.id, 'name' => file2.name }
            })
          end
        end

        context 'draft idea' do
          let(:publication_status) { 'draft' }

          example_request 'Create a draft survey response with a shapefile upload field' do
            assert_status 201
            survey = project.reload.ideas.first
            expect(survey.publication_status).to eq 'draft'
            expect(survey.custom_field_values.values).to match_array(
              IdeaFile.all.map { |file| { 'id' => file.id, 'name' => file.name } }
            )
          end
        end
      end

      describe 'without custom_field_values_params for geo fields' do
        file1 = IdeaFile.create(file: Rails.root.join('spec/fixtures/afvalkalender.pdf').open, name: 'my_file.pdf')
        file2 = IdeaFile.create(file: Rails.root.join('spec/fixtures/afvalkalender.pdf').open, name: 'my_shapefile.pdf')
        [
          { factory: :custom_field_number, value: 42 },
          { factory: :custom_field_linear_scale, value: 3 },
          { factory: :custom_field_rating, value: 3 },
          { factory: :custom_field_text, value: 'test value' },
          { factory: :custom_field_multiline_text, value: 'test value' },
          { factory: :custom_field_select, options: [:with_options], value: 'option1' },
          { factory: :custom_field_multiselect, options: [:with_options], value: %w[option1 option2] },
          { factory: :custom_field_multiselect_image, options: [:with_options], value: %w[image1] },
          { factory: :custom_field_file_upload, value: { 'id' => file1.id, 'name' => file1.name } },
          { factory: :custom_field_shapefile_upload, value: { 'id' => file2.id, 'name' => file2.name } },
          { factory: :custom_field_html_multiloc, value: { 'fr-FR' => '<p>test value</p>' } } # This field does not seem to be supported by native surveys but occurs on production
        ].each do |field_desc|
          describe do
            let(:project) { create(:single_phase_native_survey_project) }
            let(:form) { create(:custom_form, participation_context: project.phases.first) }
            let!(:survey_field) { create(field_desc[:factory], key: 'custom_field_name1', required: true, resource: form) }
            let!(:custom_field_name1) { field_desc[:value] }

            example_request "Create a response with a #{field_desc[:factory]} field" do
              assert_status 201
              json_response = json_parse(response_body)
              idea_from_db = Idea.find(json_response[:data][:id])
              expect(idea_from_db.custom_field_values).to eq({
                'custom_field_name1' => field_desc[:value]
              })
            end
          end
        end
      end

      describe 'with custom_field_values_params for geo fields' do
        let(:project) { create(:single_phase_native_survey_project) }
        let(:form) { create(:custom_form, participation_context: project.phases.first) }

        where(:factory, :param_value, :expected_stored_value) do
          [
            [:custom_field_point, 'POINT (4.31 50.85)', { 'type' => 'Point', 'coordinates' => [4.31, 50.85] }],
            [
              :custom_field_line,
              'LINESTRING (4.30 50.85, 4.660 51.15)',
              { 'type' => 'LineString', 'coordinates' => [[4.30, 50.85], [4.660, 51.15]] }
            ],
            [
              :custom_field_polygon,
              'POLYGON ((4.3 50.85, 4.31 50.85, 4.31 50.86, 4.3 50.85))',
              { 'type' => 'Polygon', 'coordinates' => [[[4.3, 50.85], [4.31, 50.85], [4.31, 50.86], [4.3, 50.85]]] }
            ]
          ]
        end

        with_them do
          describe do
            let!(:survey_field) { create(factory, key: 'custom_field_name1', required: true, resource: form) }
            let!(:custom_field_name1) { param_value }

            example_request "Create a response with a #{params[:factory]} field" do
              assert_status 201
              json_response = json_parse(response_body)
              idea_from_db = Idea.find(json_response[:data][:id])
              expect(idea_from_db.custom_field_values).to eq({
                'custom_field_name1' => expected_stored_value
              })
            end
          end
        end
      end

      context 'with an active participation context' do
        let!(:custom_field) do
          create(
            :custom_field,
            resource: custom_form,
            key: 'custom_field_name1',
            enabled: true,
            title_multiloc: { 'en' => 'What is your favourite pet?' },
            description_multiloc: { 'en' => 'Enter one pet.' }
          )
        end
        let(:custom_field_name1) { 'Cat' }

        describe 'with an active native survey phase' do
          let(:project) { create(:project_with_active_native_survey_phase) }
          let(:active_phase) { project.phases.first }
          let(:custom_form) { create(:custom_form, participation_context: active_phase) }

          example_request 'Create an input' do
            assert_status 201
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
            inputs = project.reload.ideas
            expect(inputs.size).to eq 1
            input = inputs.first
            expect(inputs.first.phase_ids).to eq [active_phase.id]
            expect(input.custom_field_values).to eq({ 'custom_field_name1' => 'Cat' })
            expect(input.creation_phase_id).to eq active_phase.id
          end

          context 'when there is an "other" option selected for a custom field' do
            let!(:custom_field2) { create(:custom_field_select, :with_options, key: 'custom_field_name2', resource: custom_form) }
            let!(:other_option) { create(:custom_field_option, custom_field: custom_field2, other: true, key: 'other', title_multiloc: { 'en' => 'Other' }) }

            let(:custom_field_name2) { 'other' }
            let(:custom_field_name2_other) { 'a text value here' }

            example_request 'Create an input with an other option and text field' do
              assert_status 201
              input = project.reload.ideas.first
              expect(input.custom_field_values).to match({
                'custom_field_name1' => 'Cat',
                'custom_field_name2' => 'other',
                'custom_field_name2_other' => 'a text value here'
              })
            end
          end

          context 'when there are "other" options for a custom fields, but "other" is not selected' do
            let!(:custom_field2) { create(:custom_field_select, key: 'custom_field_name2', resource: custom_form) }
            let!(:first_option) { create(:custom_field_option, custom_field: custom_field2, other: true, key: 'first', title_multiloc: { 'en' => 'First' }) }
            let!(:other_option) { create(:custom_field_option, custom_field: custom_field2, other: true, key: 'other', title_multiloc: { 'en' => 'Other' }) }

            let!(:custom_field3) { create(:custom_field_multiselect, key: 'custom_field_name3', resource: custom_form) }
            let!(:an_option) { create(:custom_field_option, custom_field: custom_field3, other: true, key: 'something', title_multiloc: { 'en' => 'Something' }) }
            let!(:other_other_option) { create(:custom_field_option, custom_field: custom_field3, other: true, key: 'other', title_multiloc: { 'en' => 'Other' }) }

            let(:custom_field_name2) { 'first' }
            let(:custom_field_name2_other) { 'a text value here' }
            let(:custom_field_name3) { ['something'] }
            let(:custom_field_name3_other) { 'another text value here' }

            example_request 'Create an input without other text fields' do
              assert_status 201
              input = project.reload.ideas.first
              expect(input.custom_field_values).to match({
                'custom_field_name1' => 'Cat',
                'custom_field_name2' => 'first',
                'custom_field_name3' => ['something']
              })
            end
          end
        end
      end

      context 'without active participation context' do
        let(:project) { create(:project_with_future_native_survey_phase) }

        example_request '[error] Trying to create an input' do
          assert_status 400
          expect(json_parse(response_body)).to be_nil
        end
      end
    end

    context 'when phase_ids are given' do
      let(:phase_ids) { ['1234'] }
      let(:project_id) { project.id }

      describe 'in an active native survey phase' do
        let(:project) { create(:project_with_active_native_survey_phase) }

        example_request '[error] Trying to create an input' do
          assert_status 400
          expect(json_parse(response_body)).to be_nil
        end
      end

      context 'without active participation context' do
        let(:project) { create(:project_with_future_native_survey_phase) }

        example_request '[error] Trying to create an input' do
          assert_status 400
          expect(json_parse(response_body)).to be_nil
        end
      end
    end
  end

  patch 'web_api/v1/ideas/:id' do
    with_options scope: :idea do
      parameter :project_id, 'The identifier of the project that hosts the input', required: true
      parameter :custom_field_name1, 'A value for one custom field'
      parameter :custom_field_name2, 'A value for another custom field'
      parameter :custom_field_name3, 'A value for another custom field'
      parameter :custom_field_name4, 'A value for another custom field'
      parameter :custom_field_name5, 'A value for another custom field'
      parameter :publication_status, 'published or draft'
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:active_phase) { project.phases.first }
    let(:custom_form) { create(:custom_form, participation_context: active_phase) }
    let(:creation_phase) { active_phase }
    let!(:input) do
      create(
        :idea,
        author: user,
        project: project,
        custom_field_values: {
          custom_field_name1: 'Cat'
        },
        creation_phase: creation_phase,
        phases: [creation_phase].compact
      )
    end
    let(:id) { input.id }
    let(:project_id) { project.id }

    context 'with active participation context' do
      let!(:text_field) do
        create(
          :custom_field,
          resource: custom_form,
          key: 'custom_field_name1',
          enabled: true,
          title_multiloc: { 'en' => 'What is your favourite pet?' },
          description_multiloc: { 'en' => 'Enter one pet.' }
        )
      end
      let!(:files_field) do
        create(
          :custom_field,
          resource: custom_form,
          input_type: 'file_upload',
          key: 'custom_field_name2',
          enabled: true,
          title_multiloc: { 'en' => 'Please upload a plan' }
        )
      end

      context 'when survey is published' do
        let(:custom_field_name1) { 'Dog' }

        example_request '[error] Trying to update an input' do
          assert_status 401
          json_response = json_parse(response_body)
          expect(json_response).to eq({ errors: { base: [{ error: 'Unauthorized!' }] } })
        end
      end

      context 'when survey is draft' do
        context 'with existing file upload' do
          let!(:existing_file) { create(:idea_file, idea: input, name: 'existing_file.pdf') }

          let(:custom_field_name2) do
            {
              id: existing_file.id,
              name: existing_file.name
            }
          end

          example 'Create a survey response with file upload fields' do
            input.update!(publication_status: 'draft')

            do_request
            assert_status 200

            # Verify that the input is saved correctly
            inputs = project.reload.ideas
            expect(inputs.size).to eq 1
            expect(IdeaFile.count).to eq 1

            # Verify that the custom field value is still the existing referenced file.
            expect(input.reload.custom_field_values).to eq({
              'custom_field_name2' => { 'id' => existing_file.id, 'name' => 'existing_file.pdf' }
            })
          end
        end

        context 'with new file upload' do
          let(:file_name) { 'afvalkalender.pdf' }

          let(:custom_field_name2) do
            {
              content: file_as_base64(file_name, 'application/pdf'),
              name: file_name
            }
          end

          example 'Create a survey response with file upload fields' do
            input.update!(publication_status: 'draft')

            do_request
            assert_status 200

            # Verify that the input is saved correctly
            inputs = project.reload.ideas
            expect(inputs.size).to eq 1
            expect(IdeaFile.count).to eq 1
            new_idea_file = IdeaFile.first

            # Verify that the custom field value is saved correctly.
            expect(input.reload.custom_field_values).to eq({
              'custom_field_name2' => { 'id' => new_idea_file.id, 'name' => file_name }
            })
          end
        end

        context 'with geo fields' do
          let!(:point_field) { create(:custom_field_point, resource: custom_form, key: 'custom_field_name3') }
          let!(:line_field) { create(:custom_field_line, resource: custom_form, key: 'custom_field_name4') }
          let!(:polygon_field) { create(:custom_field_polygon, resource: custom_form, key: 'custom_field_name5') }

          let(:custom_field_name3) { 'POINT (4.31 50.85)' }
          let(:custom_field_name4) { 'LINESTRING (4.30 50.85, 4.660 51.15)' }
          let(:custom_field_name5) { 'POLYGON ((4.3 50.85, 4.31 50.85, 4.31 50.86, 4.3 50.85))' }

          example 'Create a survey response with geo fields' do
            input.update!(publication_status: 'draft')

            do_request
            assert_status 200

            # Verify that the input is saved correctly
            inputs = project.reload.ideas
            expect(inputs.size).to eq 1

            # Verify that the custom field values are saved correctly.
            expect(input.reload.custom_field_values).to eq({
              'custom_field_name3' => { 'type' => 'Point', 'coordinates' => [4.31, 50.85] },
              'custom_field_name4' => { 'type' => 'LineString', 'coordinates' => [[4.30, 50.85], [4.660, 51.15]] },
              'custom_field_name5' => {
                'type' => 'Polygon',
                'coordinates' => [[[4.3, 50.85], [4.31, 50.85], [4.31, 50.86], [4.3, 50.85]]]
              }
            })
          end
        end

        # Tests the context where the survey has been opened in two tabs and the user submits one of them.
        # context 'when there are two surveys in draft' do
        #   let(:publication_status) { 'published' }

        #   example 'Survey submits and removes other drafts by the same user' do
        #     input.update!(publication_status: 'draft')
        #     draft_survey_to_delete = create(
        #       :native_survey_response,
        #       author: user,
        #       project: project,
        #       creation_phase: creation_phase,
        #       publication_status: 'draft'
        #     )
        #     draft_survey_to_delete_id = draft_survey_to_delete.id

        #     do_request
        #     assert_status 200
        #     expect(project.reload.ideas.size).to eq 1
        #     expect { Idea.find(draft_survey_to_delete_id) }.to raise_error(ActiveRecord::RecordNotFound)
        #   end
        # end
      end
    end

    context 'without active participation context' do
      describe 'before all phases' do
        let(:creation_phase) { nil }
        let(:project) { create(:project_with_future_phases) }

        example_request '[error] Trying to update an input' do
          assert_status 401
          json_response = json_parse(response_body)
          expect(json_response).to eq({ errors: { base: [{ error: 'project_inactive' }] } })
        end
      end

      describe 'after all phases' do
        let(:creation_phase) { nil }
        let(:project) { create(:project_with_past_phases) }

        example_request '[error] Trying to update an input' do
          assert_status 401
          json_response = json_parse(response_body)
          expect(json_response).to eq({ errors: { base: [{ error: 'project_inactive' }] } })
        end
      end
    end
  end
end
