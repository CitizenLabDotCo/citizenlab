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

  post 'web_api/v1/phases/:phase_id/inputs' do
    with_options scope: :idea do
      parameter :custom_field_name1, 'A value for one custom field'
      parameter :custom_field_name2, 'A value for another custom field'
      parameter :custom_field_name2_other, 'A custom text value for an "other" option in custom fields'
      parameter :custom_field_name3, 'A value for another custom field'
      parameter :custom_field_name3_other, 'A custom text value for an "other" option in custom fields'
      parameter :publication_status, 'Draft or published', required: false
    end
    ValidationErrorHelper.new.error_fields(self, Idea)

    let(:phase_id) { project.phases.first.id }

    context 'with two file upload fields' do
      let(:filename1) { 'afvalkalender2022.pdf' }
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
          expect(json_response_body.dig(:data, :relationships, :project, :data, :id)).to eq project.id

          # Verify that the input is saved correctly
          input = project.reload.ideas.sole
          expect(input.phase_ids).to eq [project.phases.first.id]
          expect(input.creation_phase).to eq project.phases.first

          # Verify that the files are saved correctly
          expect(input.idea_files).to be_empty
          expect(input.file_attachments.size).to eq(2)
          expect(input.attached_files.size).to eq(2)

          file_attachment1_id = response_data.dig(:attributes, :custom_field_name1, :id)
          attachment1 = input.file_attachments.find(file_attachment1_id)
          expect(attachment1.file.name).to eq(filename1)

          file_attachment2_id = response_data.dig(:attributes, :custom_field_name2, :id)
          attachment2 = input.file_attachments.find(file_attachment2_id)
          expect(attachment2.file.name).to eq(filename2)

          expect(input.custom_field_values).to match(
            'custom_field_name1' => { 'id' => file_attachment1_id, 'name' => filename1 },
            'custom_field_name2' => { 'id' => file_attachment2_id, 'name' => filename2 }
          )
        end
      end

      context 'draft idea' do
        let(:publication_status) { 'draft' }

        example_request 'Create a draft survey response with a file upload field' do
          assert_status 201
          survey = project.reload.ideas.first
          expect(survey.publication_status).to eq 'draft'
          expect(survey.custom_field_values.values).to match_array(
            survey.file_attachments.map { |attachment| { 'id' => attachment.id, 'name' => attachment.file.name } }
          )
        end
      end

      context 'when a file exceeds the maximum upload size' do
        # Stubbed rather than posting a payload over the real 100 MB ceiling.
        before do
          allow_any_instance_of(Files::FileUploader).to receive(:size_range).and_return((1.byte)..(100.bytes))
        end

        example_request '[error] Create a survey response with an oversized file' do
          assert_status 422

          # Both fields are oversized; only the first is reported.
          expect(json_response_body[:errors].keys).to eq [:custom_field_name1]

          error = json_response_body.dig(:errors, :custom_field_name1, 0)
          expect(error[:error]).to eq 'file_too_large'
          expect(error[:value]).to eq filename1
          expect(error[:payload]).to have_key(:max_size_mb)

          # Nothing is written, so the user can swap the file out and resubmit.
          expect(project.reload.ideas).to be_empty
          expect(Files::File.count).to eq 0
          expect(Files::FileAttachment.count).to eq 0
        end
      end
    end

    context 'with two shapefile upload fields' do
      let(:filename1) { 'afvalkalender2022.zip' }
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
          expect(json_response_body.dig(:data, :relationships, :project, :data, :id)).to eq project.id

          # Verify that the input is saved correctly
          input = project.reload.ideas.sole
          expect(input.phase_ids).to eq [project.phases.first.id]
          expect(input.creation_phase).to eq project.phases.first

          # Verify that the files are saved correctly
          expect(input.idea_files).to be_empty
          expect(input.file_attachments.size).to eq(2)
          expect(input.attached_files.size).to eq(2)

          file_attachment1_id = response_data.dig(:attributes, :custom_field_name1, :id)
          attachment1 = input.file_attachments.find(file_attachment1_id)
          expect(attachment1.file.name).to eq(filename1)

          file_attachment2_id = response_data.dig(:attributes, :custom_field_name2, :id)
          attachment2 = input.file_attachments.find(file_attachment2_id)
          expect(attachment2.file.name).to eq filename2

          expect(input.custom_field_values).to match(
            'custom_field_name1' => { 'id' => file_attachment1_id, 'name' => filename1 },
            'custom_field_name2' => { 'id' => file_attachment2_id, 'name' => filename2 }
          )
        end
      end

      context 'draft idea' do
        let(:publication_status) { 'draft' }

        example_request 'Create a draft survey response with a shapefile upload field' do
          assert_status 201
          survey = project.reload.ideas.first
          expect(survey.publication_status).to eq 'draft'
          expect(survey.custom_field_values.values).to match_array(
            survey.file_attachments.map { |attachment| { 'id' => attachment.id, 'name' => attachment.file.name } }
          )
        end
      end
    end

    describe 'with all supported input types' do
      with_options scope: :idea do
        parameter :text_field, 'A text field'
        parameter :multiline_field, 'A multiline text field'
        parameter :number_field, 'A number field'
        parameter :date_field, 'A date field'
        parameter :checkbox_field, 'A checkbox field'
        parameter :linear_scale_field, 'A linear scale field'
        parameter :rating_field, 'A rating field'
        parameter :sentiment_field, 'A sentiment scale field'
        parameter :sentiment_field_follow_up, 'The follow-up text for the sentiment scale field'
        parameter :select_field, 'A select field'
        parameter :other_select_field, 'A select field with an other option'
        parameter :other_select_field_other, 'The other text for the select field'
        parameter :select_image_field, 'An image select field'
        parameter :multiselect_field, 'A multiselect field'
        parameter :multiselect_image_field, 'An image multiselect field'
        parameter :ranking_field, 'A ranking field'
        parameter :matrix_field, 'A matrix field'
        parameter :text_multiloc_field, 'A multiloc text field'
        parameter :multiline_multiloc_field, 'A multiloc multiline text field'
        parameter :html_multiloc_field, 'A multiloc HTML field'
        parameter :point_field, 'A point field'
        parameter :line_field, 'A line field'
        parameter :polygon_field, 'A polygon field'
        parameter :multipoint_field, 'A multipoint field'
      end

      let(:project) { create(:single_phase_native_survey_project) }
      let(:form) { create(:custom_form, participation_context: project.phases.first) }

      let!(:text_cf) { create(:custom_field_text, resource: form, key: 'text_field') }
      let!(:multiline_cf) { create(:custom_field_multiline_text, resource: form, key: 'multiline_field') }
      let!(:number_cf) { create(:custom_field_number, resource: form, key: 'number_field') }
      let!(:date_cf) { create(:custom_field_date, resource: form, key: 'date_field') }
      let!(:checkbox_cf) { create(:custom_field_checkbox, resource: form, key: 'checkbox_field') }
      let!(:linear_scale_cf) { create(:custom_field_linear_scale, resource: form, key: 'linear_scale_field') }
      let!(:rating_cf) { create(:custom_field_rating, resource: form, key: 'rating_field') }
      let!(:sentiment_cf) { create(:custom_field_sentiment_linear_scale, resource: form, key: 'sentiment_field', ask_follow_up: true) }
      let!(:select_cf) { create(:custom_field_select, :with_options, resource: form, key: 'select_field') }
      let!(:other_select_cf) do
        create(:custom_field_select, resource: form, key: 'other_select_field').tap do |field|
          create(:custom_field_option, custom_field: field, key: 'cat')
          create(:custom_field_option, custom_field: field, key: 'other', other: true)
        end
      end
      let!(:select_image_cf) { create(:custom_field_select_image, :with_options, resource: form, key: 'select_image_field') }
      let!(:multiselect_cf) { create(:custom_field_multiselect, :with_options, resource: form, key: 'multiselect_field') }
      let!(:multiselect_image_cf) { create(:custom_field_multiselect_image, :with_options, resource: form, key: 'multiselect_image_field') }
      let!(:ranking_cf) { create(:custom_field_ranking, :with_options, resource: form, key: 'ranking_field') }
      let!(:matrix_cf) { create(:custom_field_matrix_linear_scale, resource: form, key: 'matrix_field') }
      let!(:text_multiloc_cf) { create(:custom_field, input_type: 'text_multiloc', resource: form, key: 'text_multiloc_field') }
      let!(:multiline_multiloc_cf) { create(:custom_field, input_type: 'multiline_text_multiloc', resource: form, key: 'multiline_multiloc_field') }
      let!(:html_multiloc_cf) { create(:custom_field_html_multiloc, resource: form, key: 'html_multiloc_field') }
      let!(:point_cf) { create(:custom_field_point, resource: form, key: 'point_field') }
      let!(:line_cf) { create(:custom_field_line, resource: form, key: 'line_field') }
      let!(:polygon_cf) { create(:custom_field_polygon, resource: form, key: 'polygon_field') }
      let!(:multipoint_cf) { create(:custom_field_multipoint, resource: form, key: 'multipoint_field') }

      let(:text_field) { 'A text answer' }
      let(:multiline_field) { "Line 1\nLine 2" }
      let(:number_field) { 42 }
      let(:date_field) { '2026-08-07' }
      let(:checkbox_field) { false }
      let(:linear_scale_field) { 3 }
      let(:rating_field) { 4 }
      let(:sentiment_field) { 2 }
      let(:sentiment_field_follow_up) { 'Because I said so' }
      let(:select_field) { 'option1' }
      let(:other_select_field) { 'other' }
      let(:other_select_field_other) { 'A ferret' }
      let(:select_image_field) { 'image1' }
      let(:multiselect_field) { %w[option1 option2] }
      let(:multiselect_image_field) { %w[image1] }
      let(:ranking_field) { %w[by_bike by_train] }
      let(:matrix_field) { { send_more_animals_to_space: 5, ride_bicycles_more_often: 1 } }
      let(:text_multiloc_field) { { 'en' => 'An answer' } }
      let(:multiline_multiloc_field) { { 'en' => "An answer\nwith a second line" } }
      let(:html_multiloc_field) { { 'fr-FR' => '<p>test value</p>' } }
      let(:point_field) { 'POINT (4.31 50.85)' }
      let(:line_field) { 'LINESTRING (4.30 50.85, 4.660 51.15)' }
      let(:polygon_field) { 'POLYGON ((4.3 50.85, 4.31 50.85, 4.31 50.86, 4.3 50.85))' }
      let(:multipoint_field) { 'MULTIPOINT (4.35 50.85, 4.36 50.86)' }

      example_request 'Create a response with all supported input types', document: false do
        assert_status 201
        json_response = json_parse(response_body)
        input = Idea.find(json_response[:data][:id])
        expect(input.custom_field_values).to eq({
          'text_field' => 'A text answer',
          'multiline_field' => "Line 1\nLine 2",
          'number_field' => 42,
          'date_field' => '2026-08-07',
          'checkbox_field' => false,
          'linear_scale_field' => 3,
          'rating_field' => 4,
          'sentiment_field' => 2,
          'sentiment_field_follow_up' => 'Because I said so',
          'select_field' => 'option1',
          'other_select_field' => 'other',
          'other_select_field_other' => 'A ferret',
          'select_image_field' => 'image1',
          'multiselect_field' => %w[option1 option2],
          'multiselect_image_field' => %w[image1],
          'ranking_field' => %w[by_bike by_train],
          'matrix_field' => { 'send_more_animals_to_space' => 5, 'ride_bicycles_more_often' => 1 },
          'text_multiloc_field' => { 'en' => 'An answer' },
          'multiline_multiloc_field' => { 'en' => "An answer\nwith a second line" },
          'html_multiloc_field' => { 'fr-FR' => '<p>test value</p>' },
          'point_field' => { 'type' => 'Point', 'coordinates' => [4.31, 50.85] },
          'line_field' => { 'type' => 'LineString', 'coordinates' => [[4.30, 50.85], [4.660, 51.15]] },
          'polygon_field' => {
            'type' => 'Polygon',
            'coordinates' => [[[4.3, 50.85], [4.31, 50.85], [4.31, 50.86], [4.3, 50.85]]]
          },
          'multipoint_field' => { 'type' => 'MultiPoint', 'coordinates' => [[4.35, 50.85], [4.36, 50.86]] }
        })
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
          expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project.id
          inputs = project.reload.ideas
          expect(inputs.size).to eq 1
          input = inputs.first
          expect(inputs.first.phase_ids).to eq [active_phase.id]
          expect(input.custom_field_values).to eq({ 'custom_field_name1' => 'Cat' })
          expect(input.creation_phase_id).to eq active_phase.id
        end
      end
    end

    context 'without active participation context' do
      let(:project) { create(:project_with_future_native_survey_phase) }
      let(:publication_status) { 'published' }

      example_request '[error] Trying to create an input' do
        assert_status 401
        expect(json_response_body).to eq({ errors: { base: [{ error: 'inactive_phase' }] } })
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

            expect { do_request }
              .to change(Files::FileAttachment, :count).by(1)
              .and change(Files::File, :count).by(1)
              .and not_change(IdeaFile, :count)

            assert_status 200

            file_attachment = input.file_attachments.sole
            expect(file_attachment.file.name).to eq(file_name)

            expect(input.reload.custom_field_values).to eq({
              'custom_field_name2' => { 'id' => file_attachment.id, 'name' => file_name }
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

        context 'custom_field_values update semantics' do
          with_options scope: :idea do
            parameter :select_field, 'A select field with an other option'
            parameter :select_field_other, 'The other text for the select field'
            parameter :multiselect_field, 'A multiselect field'
            parameter :checkbox_field, 'A checkbox field'
            parameter :number_field, 'A number field'
            parameter :matrix_field, 'A matrix field'
            parameter :unknown_field, 'A field that is not part of the form'
            parameter :custom_field_values, 'All custom field values as one nested object'
          end

          let!(:select_cf) do
            create(:custom_field_select, resource: custom_form, key: 'select_field').tap do |field|
              create(:custom_field_option, custom_field: field, key: 'cat')
              create(:custom_field_option, custom_field: field, key: 'other', other: true)
            end
          end
          let!(:multiselect_cf) { create(:custom_field_multiselect, :with_options, resource: custom_form, key: 'multiselect_field') }
          let!(:checkbox_cf) { create(:custom_field_checkbox, resource: custom_form, key: 'checkbox_field') }
          let!(:number_cf) { create(:custom_field_number, resource: custom_form, key: 'number_field') }
          let!(:matrix_cf) { create(:custom_field_matrix_linear_scale, resource: custom_form, key: 'matrix_field') }
          let!(:disabled_cf) { create(:custom_field_text, resource: custom_form, key: 'disabled_field', enabled: false) }

          let!(:input) do
            create(
              :idea,
              author: user,
              project: project,
              custom_field_values: {
                'custom_field_name1' => 'Cat',
                'select_field' => 'other',
                'select_field_other' => 'A ferret',
                'multiselect_field' => %w[option1 option2],
                'checkbox_field' => true,
                'number_field' => 42,
                'matrix_field' => { 'send_more_animals_to_space' => 1, 'ride_bicycles_more_often' => 2 },
                'disabled_field' => 'legacy value'
              },
              creation_phase: creation_phase,
              phases: [creation_phase]
            )
          end

          before { input.update!(publication_status: 'draft') }

          describe 'updating some values while omitting others' do
            let(:custom_field_name1) { 'Dog' }
            let(:select_field) { 'cat' }
            let(:select_field_other) { 'A ferret' } # Stale: the parent no longer has the other value
            let(:checkbox_field) { false }
            let(:matrix_field) { { send_more_animals_to_space: 3, unknown_statement: 5 } }
            let(:multiselect_field) { 'not-an-array' }
            let(:unknown_field) { 'some value' }

            example_request 'Update merges values, clears omitted keys and keeps policy-stripped values', document: false do
              assert_status 200
              # number_field (omitted) and select_field_other (stale) were cleared.
              expect(input.reload.custom_field_values).to eq({
                'custom_field_name1' => 'Dog',
                'select_field' => 'cat',
                'checkbox_field' => false,
                'matrix_field' => { 'send_more_animals_to_space' => 3 }, # replaced wholesale, unknown statement dropped
                'multiselect_field' => %w[option1 option2], # wrong-shaped value in the request, so the stored value survives
                'disabled_field' => 'legacy value' # stripped by permit rather than omitted, so preserved
              })
            end
          end

          describe 'updating with an empty custom_field_values object' do
            let(:custom_field_values) { {} }

            example_request 'Update does not change the custom field values', document: false do
              assert_status 200
              expect(input.reload.custom_field_values).to eq({
                'custom_field_name1' => 'Cat',
                'select_field' => 'other',
                'select_field_other' => 'A ferret',
                'multiselect_field' => %w[option1 option2],
                'checkbox_field' => true,
                'number_field' => 42,
                'matrix_field' => { 'send_more_animals_to_space' => 1, 'ride_bicycles_more_often' => 2 },
                'disabled_field' => 'legacy value'
              })
            end
          end
        end
      end
    end

    context 'without active participation context' do
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
