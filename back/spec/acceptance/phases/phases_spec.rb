# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phases' do
  explanation 'Timeline projects consist of multiple phases through which ideas can transit.'

  let(:json_response) { json_parse(response_body) }

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/phases/:id/mini' do
    let(:phase) { create(:phase) }
    let(:id) { phase.id }

    example 'Get a phase by id' do
      phase.update!(report: build(:report))
      do_request
      assert_status 200

      expect(json_response.dig(:data, :id)).to eq phase.id
      expect(json_response.dig(:data, :type)).to eq 'phase_mini'

      expect(json_response.dig(:data, :attributes, :action_descriptors).keys).to match_array(%i[
        posting_idea commenting_idea reacting_idea comment_reacting_idea
        annotating_document taking_survey taking_poll voting volunteering
      ])

      expect(json_response.dig(:data, :relationships, :project)).to match({
        data: { id: phase.project_id, type: 'project' }
      })

      expect(json_response.dig(:data, :relationships, :report)).to match({
        data: { id: phase.report.id, type: 'report' }
      })
    end
  end

  get 'web_api/v1/phases/:id' do
    let(:phase) { create(:phase) }
    let(:id) { phase.id }

    context 'community monitor phase with everyone tracking, when the survey was already submitted' do
      before { create(:idea_status_proposed) }

      let(:phase) do
        phase = create(:community_monitor_survey_phase, with_permissions: true)
        phase.permissions.first.update!(permitted_by: 'everyone', everyone_tracking_enabled: true)
        phase
      end
      let!(:survey_response) { create(:native_survey_response, project: phase.project, creation_phase: phase, author: nil, author_hash: 'COOKIE_AUTHOR_HASH') }

      example 'Get a phase reports posting_limited_max_reached based on the submission cookie', document: false do
        header('Cookie', "#{phase.id}={\"lo\": \"COOKIE_AUTHOR_HASH\"};cl2_consent={\"analytics\": true}")
        do_request
        assert_status 200

        disabled_reason = json_response.dig(:data, :attributes, :action_descriptors, :posting_idea, :disabled_reason)
        expect(disabled_reason).to eq 'posting_limited_max_reached'
      end
    end

    example 'Get one phase by id' do
      create_list(:idea, 2, project: phase.project, phases: [phase])
      Permissions::PermissionsUpdateService.new.update_all_permissions
      phase.update!(report: build(:report))
      do_request
      assert_status 200

      expect(json_response.dig(:data, :id)).to eq phase.id
      expect(json_response.dig(:data, :type)).to eq 'phase'
      expect(json_response.dig(:data, :attributes)).to include(
        reacting_like_method: 'unlimited',
        ideas_count: 2
      )

      expect(json_response.dig(:data, :relationships, :project)).to match({
        data: { id: phase.project_id, type: 'project' }
      })

      expect(json_response.dig(:data, :relationships, :report)).to match({
        data: { id: phase.report.id, type: 'report' }
      })

      expect(json_response.dig(:data, :relationships, :permissions, :data).size)
        .to eq(Permission.available_actions(phase).length)

      expect(json_response[:included].pluck(:type)).to include 'permission'
    end
  end

  get 'web_api/v1/phases/:id/submission_count' do
    let(:phase) { create(:native_survey_phase) }
    let(:id) { phase.id }

    before do
      create(:idea_status_proposed)
      create_list(:native_survey_response, 2, creation_phase: phase, project: phase.project, phases: [phase])
      create_list(:idea, 3, project: phase.project, phases: [phase])
    end

    context 'native survey' do
      example 'Get count when native survey phase (ignores ideas)' do
        do_request
        assert_status 200
        expect(response_data[:attributes]).to eq({ totalSubmissions: 2 })
      end
    end
  end

  get 'web_api/v1/phases/:id/as_xlsx' do
    describe do
      let(:id) { create(:project_with_active_ideation_phase).phases.first.id }

      example '[error] Try downloading phase inputs' do
        do_request
        assert_status 401
      end
    end
  end

  get 'web_api/v1/phases/:id/progress' do
    explanation 'Get progress of the current user in a Common Ground phase'

    let_it_be(:phase) { create(:common_ground_phase) }
    let(:id) { phase.id }

    context 'when visitor' do
      example 'Unauthorized (401)', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when logged in' do
      before do
        current_user = create(:user)
        header_token_for(current_user)

        i1, @i2 = create_pair(:idea, project: phase.project, phases: [phase])
        create(:reaction, reactable: i1, user: current_user)
      end

      # The next idea is necessarily the one that doesn't have a reaction
      let(:next_idea) { @i2 }

      example_request 'Get user progress' do
        assert_status 200

        expect(response_data).to match(
          id: phase.id,
          type: 'common_ground_progress',
          attributes: {
            num_ideas: 2,
            num_reacted_ideas: 1
          },
          relationships: {
            next_idea: { data: { id: next_idea.id, type: 'idea' } }
          }
        )

        expect(json_response_body[:included]).to include(
          hash_including(id: next_idea.id, type: 'idea')
        )
      end

      context 'when the phase is not "common ground"' do
        let(:id) { create(:phase).id }

        example 'Not found (404)', document: false do
          do_request
          assert_status 404
        end
      end
    end
  end

  delete 'web_api/v1/phases/:id/inputs' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:active_phase) { project.phases.first }
    let(:id) { active_phase.id }

    example '[error] Delete all inputs of a phase' do
      create(:idea, project: project, phases: [active_phase])

      do_request
      assert_status 401
    end
  end

  context 'when admin' do
    before do
      admin_header_token
      SettingsService.new.activate_feature!('prescreening_ideation')
    end

    delete 'web_api/v1/phases/:id' do
      let(:project) { create(:project) }
      let(:phase) { create(:phase, project: project) }
      let(:id) { phase.id }

      example_request 'Delete a phase' do
        expect(response_status).to eq 200
        expect { Comment.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      context 'on a native survey phase' do
        let(:phase) { create(:native_survey_phase, project: project) }

        example 'Deleting a phase deletes all survey responses', document: false do
          ideation_phase = create(:phase, participation_method: 'ideation', project: project, start_at: (phase.start_at - 7.days), end_at: (phase.start_at - 1.day))
          idea = create(:idea, project: project, phases: [ideation_phase])
          responses = create_list(:idea, 2, project: project, creation_phase: phase, phases: [phase])

          do_request

          expect { idea.reload }.not_to raise_error
          responses.each do |response|
            expect { response.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end
      end

      context 'on an ideation phase' do
        let(:phase) { create(:phase, participation_method: 'ideation', project: project) }

        example 'Deleting a phase does not delete the ideas', document: false do
          idea = create(:idea, project: project, phases: [phase])

          do_request

          expect { idea.reload }.not_to raise_error
        end
      end

      # Edge case: Historic code means a phase with ideas could be changed to an information phase
      context 'on an information phase' do
        let(:phase) { create(:phase, participation_method: 'information', project: project) }

        example 'Deleting a phase does not delete the ideas', document: false do
          idea = create(:idea, project: project, phases: [phase])

          do_request

          expect { idea.reload }.not_to raise_error
        end
      end
    end

    get 'web_api/v1/phases/:id/survey_results' do
      parameter :logic_ids, 'Array of page or option ids to filter the results by logic', required: false
      parameter :year, 'First month to include in the survey results', required: false
      parameter :quarter, 'Last month to include in the survey results', required: false

      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.first }
      let(:form) { create(:custom_form, participation_context: active_phase) }
      let(:id) { active_phase.id }
      let(:multiselect_field) do
        create(
          :custom_field_multiselect,
          resource: form,
          title_multiloc: { 'en' => 'What are your favourite pets?' },
          description_multiloc: {},
          required: true
        )
      end
      let!(:cat_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'cat', title_multiloc: { 'en' => 'Cat' })
      end
      let!(:dog_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'dog', title_multiloc: { 'en' => 'Dog' })
      end
      let!(:survey_response1) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat dog] }
        )
      end
      let!(:survey_response2) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat] }
        )
      end

      example 'Get survey results' do
        do_request
        expect(status).to eq 200

        expect(response_data[:type]).to eq 'survey_results'
        expect(response_data.dig(:attributes, :totalSubmissions)).to eq 2
        expect(response_data.dig(:attributes, :results).count).to eq 1
        expect(response_data.dig(:attributes, :results, 0)).to match(
          {
            customFieldId: multiselect_field.id,
            inputType: 'multiselect',
            question: { en: 'What are your favourite pets?' },
            description: {},
            required: true,
            grouped: false,
            hidden: false,
            pageNumber: nil,
            questionNumber: 1,
            questionCategory: nil,
            logic: {},
            totalResponseCount: 2,
            questionResponseCount: 2,
            totalPickCount: 3,
            answers: [
              { answer: 'cat', count: 2 },
              { answer: 'dog', count: 1 },
              { answer: nil, count: 0 }
            ],
            multilocs: {
              answer: {
                cat: { title_multiloc: { en: 'Cat' } },
                dog: { title_multiloc: { en: 'Dog' } }
              }
            }
          }
        )
      end
    end

    get 'web_api/v1/phases/:id/common_ground_results' do
      let(:phase) { create(:common_ground_phase) }
      let(:id) { phase.id }

      context 'when not logged in' do
        def create_idea(phase, downvotes, neutral, upvotes)
          idea = create(:idea, project: phase.project, phases: [phase])
          create_list(:reaction, downvotes, reactable: idea, mode: 'down')
          create_list(:reaction, neutral, reactable: idea, mode: 'neutral')
          create_list(:reaction, upvotes, reactable: idea, mode: 'up')
          idea
        end

        let!(:i1) { create_idea(phase, 1, 0, 2) }
        let!(:i2) { create_idea(phase, 1, 1, 0) }
        let!(:i3) { create_idea(phase, 1, 1, 1) }

        before do
          # idea with only neutral reactions that should not be included in results
          create_idea(phase, 0, 1, 0)
        end

        example_request 'Get common ground results' do
          assert_status 200

          expect(response_data).to match(
            id: phase.id,
            type: 'common_ground_results',
            attributes: {
              top_consensus_ideas: be_an(Array),
              top_controversial_ideas: be_an(Array),
              stats: {
                num_participants: 9, # each reaction is from a different user
                num_ideas: 4,
                votes: { up: 3, down: 3, neutral: 3 }
              }
            }
          )

          expect(response_data.dig(:attributes, :top_consensus_ideas).pluck(:id)).to eq [i2.id, i1.id, i3.id]
          expect(response_data.dig(:attributes, :top_controversial_ideas).pluck(:id)).to eq [i3.id, i1.id, i2.id]

          top_controversial_idea = response_data.dig(:attributes, :top_controversial_ideas, 0)
          expect(top_controversial_idea.with_indifferent_access).to match(
            id: i3.id,
            title_multiloc: i3.title_multiloc,
            votes: { down: 1, neutral: 1, up: 1 }
          )

          top_consensus_idea = response_data.dig(:attributes, :top_consensus_ideas, 0)
          expect(top_consensus_idea.with_indifferent_access).to match(
            id: i2.id,
            title_multiloc: i2.title_multiloc,
            votes: { down: 1, neutral: 1, up: 0 }
          )
        end

        context 'when the phase is not "common ground"' do
          let(:id) { create(:phase).id }

          example 'Not found (404)', document: false do
            do_request
            assert_status 400
          end
        end
      end
    end

    get 'web_api/v1/phases/:id/sentiment_by_quarter' do
      let!(:proposed_idea_status) { create(:idea_status_proposed) }

      let(:project) { create(:community_monitor_project) }
      let(:active_phase) { project.phases.first }
      let(:form) { create(:custom_form, participation_context: active_phase) }
      let(:sentiment_question1) { create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'quality_of_life') }
      let(:sentiment_question2) { create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'service_delivery') }

      let!(:survey_response1) do
        create(
          :native_survey_response,
          project: project,
          creation_phase: active_phase,
          custom_field_values: { sentiment_question1.key => 2, sentiment_question2.key => 4 },
          created_at: Time.new(2025, 1, 1)
        )
      end
      let!(:survey_response2) do
        create(
          :native_survey_response,
          project: project,
          creation_phase: active_phase,
          custom_field_values: { sentiment_question1.key => 3, sentiment_question2.key => 1 },
          created_at: Time.new(2025, 4, 1)
        )
      end

      let(:id) { active_phase.id }

      example 'Get survey sentiment by quarter' do
        do_request
        expect(status).to eq 200
        expect(response_data[:type]).to eq 'sentiment_by_quarter'
        expect(response_data[:attributes]).to eq({
          overall: {
            averages: { '2025-1': 3.0, '2025-2': 2.0 },
            totals: {
              '2025-1': { '1': 0, '2': 1, '3': 0, '4': 1, '5': 0 },
              '2025-2': { '1': 1, '2': 0, '3': 1, '4': 0, '5': 0 }
            }
          },
          categories: {
            averages: {
              quality_of_life: { '2025-2': 3.0, '2025-1': 2.0 },
              service_delivery: { '2025-2': 1.0, '2025-1': 4.0 },
              governance_and_trust: {},
              other: {}
            },
            multilocs: {
              quality_of_life: { en: 'Quality of life', 'fr-FR': 'Qualité de vie', 'nl-NL': 'Kwaliteit van leven' },
              service_delivery: { en: 'Service delivery', 'fr-FR': 'Prestation de services', 'nl-NL': 'Dienstverlening' },
              governance_and_trust: { en: 'Governance and trust', 'fr-FR': 'Gouvernance et confiance', 'nl-NL': 'Bestuur en vertrouwen' },
              other: { en: 'Other', 'fr-FR': 'Autre', 'nl-NL': 'Overig' }
            }
          }
        })
      end
    end

    get 'web_api/v1/phases/:id/submission_count' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.first }
      let(:form) { create(:custom_form, participation_context: active_phase) }
      let(:id) { active_phase.id }
      let(:multiselect_field) do
        create(
          :custom_field_multiselect,
          resource: form,
          title_multiloc: { 'en' => 'What are your favourite pets?' },
          description_multiloc: {}
        )
      end
      let!(:cat_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'cat', title_multiloc: { 'en' => 'Cat' })
      end
      let!(:dog_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'dog', title_multiloc: { 'en' => 'Dog' })
      end
      let!(:survey_response1) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat dog] }
        )
      end
      let!(:survey_response2) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat] }
        )
      end
      let!(:survey_response3) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[dog] }
        )
      end

      example 'Get submission count' do
        do_request
        expect(status).to eq 200

        expect(json_response[:data][:attributes]).to eq({ totalSubmissions: 3 })
      end
    end

    get 'web_api/v1/phases/:id/as_xlsx' do
      context 'for a native survey phase with persisted form' do
        let(:project) { create(:project_with_active_native_survey_phase) }
        let(:active_phase) { project.phases.first }
        let(:form) { create(:custom_form, participation_context: active_phase) }
        let(:id) { active_phase.id }

        # Create a page to describe that it is not included in the export.
        let!(:page_field) { create(:custom_field_page, resource: form) }
        let(:multiselect_field) do
          create(
            :custom_field_multiselect,
            resource: form,
            title_multiloc: { 'en' => 'What are your favourite pets?' },
            description_multiloc: {}
          )
        end
        let!(:cat_option) do
          create(:custom_field_option, custom_field: multiselect_field, key: 'cat', title_multiloc: { 'en' => 'Cat' })
        end
        let!(:dog_option) do
          create(:custom_field_option, custom_field: multiselect_field, key: 'dog', title_multiloc: { 'en' => 'Dog' })
        end

        before do
          config = AppConfiguration.instance
          config.settings['core']['private_attributes_in_export'] = true
          config.save!
        end

        context 'when there are inputs in the phase' do
          let!(:survey_response1) do
            create(
              :idea,
              project: project,
              creation_phase: active_phase,
              phases: [active_phase],
              custom_field_values: { multiselect_field.key => %w[cat dog] }
            )
          end
          let!(:survey_response2) do
            create(
              :idea,
              project: project,
              creation_phase: active_phase,
              phases: [active_phase],
              custom_field_values: { multiselect_field.key => %w[cat] }
            )
          end

          example 'Download native survey phase inputs in one sheet' do
            expected_params = [[survey_response1, survey_response2], active_phase]
            allow(Export::Xlsx::InputSheetGenerator).to receive(:new).and_return(Export::Xlsx::InputSheetGenerator.new(*expected_params))
            do_request
            expect(Export::Xlsx::InputSheetGenerator).to have_received(:new).with(*expected_params)

            assert_status 200
            expect(xlsx_contents(response_body)).to match([
              {
                sheet_name: active_phase.title_multiloc['en'],
                column_headers: [
                  'ID',
                  multiselect_field.title_multiloc['en'],
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Project',
                  'Imported'
                ],
                rows: [
                  [
                    survey_response1.id,
                    'Cat;Dog',
                    survey_response1.author_name,
                    survey_response1.author.email,
                    survey_response1.author_id,
                    an_instance_of(DateTime), # created_at
                    project.title_multiloc['en'],
                    'false'
                  ],
                  [
                    survey_response2.id,
                    'Cat',
                    survey_response2.author_name,
                    survey_response2.author.email,
                    survey_response2.author_id,
                    an_instance_of(DateTime), # created_at
                    project.title_multiloc['en'],
                    'false'
                  ]
                ]
              }
            ])
          end

          example 'Draft responses are not included' do
            create(
              :idea,
              project: project,
              creation_phase: active_phase,
              phases: [active_phase],
              publication_status: 'draft'
            )
            do_request

            assert_status 200
            xlsx = xlsx_contents(response_body)
            expect(xlsx.first[:rows].size).to eq 2
          end

          # NOTE: Typically, survey responses have no displayable content.
          example 'Responses with no displayable content are included' do
            survey_response1.title_multiloc = {}
            survey_response1.body_multiloc = {}
            survey_response1.save!(validate: false)

            do_request
            assert_status 200
            xlsx = xlsx_contents(response_body)
            all_values = xlsx.flat_map { |sheet| sheet[:rows].flatten }
            expect(all_values).to include(survey_response1.id)
          end
        end
      end
    end

    delete 'web_api/v1/phases/:id/inputs' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.order(:start_at).last }
      let(:id) { active_phase.id }

      example 'Delete all inputs of a phase' do
        ideation_phase = create(
          :phase,
          project: project,
          participation_method: 'ideation',
          start_at: (Time.now - 2.months),
          end_at: (Time.now - 1.month)
        )
        create_list(:idea, 2, project: project, phases: [active_phase])
        create(:idea, project: project, phases: [ideation_phase])
        expect_any_instance_of(SideFxPhaseService).to receive(:after_delete_inputs)

        do_request
        assert_status 200
        expect(Phase.find(id)).to eq active_phase
        expect(project.reload.ideas_count).to eq 1
        expect(active_phase.reload.ideas_count).to eq 0
        expect(ideation_phase.reload.ideas_count).to eq 1
        expect(Idea.count).to eq 1
      end
    end
  end

  context 'when project moderator' do
    before { header_token_for create(:project_moderator, projects: [project]) }

    get 'web_api/v1/phases/:id/as_xlsx' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.first }
      let(:form) { create(:custom_form, participation_context: active_phase) }
      let(:id) { active_phase.id }
      let(:multiselect_field) do
        create(
          :custom_field_multiselect,
          resource: form,
          title_multiloc: { 'en' => 'What are your favourite pets?' },
          description_multiloc: {}
        )
      end
      let!(:cat_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'cat', title_multiloc: { 'en' => 'Cat' })
      end
      let!(:dog_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'dog', title_multiloc: { 'en' => 'Dog' })
      end
      let!(:survey_response) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat dog] }
        )
      end

      example 'Download phase inputs WITH private user data', document: false do
        config = AppConfiguration.instance
        config.settings['core']['private_attributes_in_export'] = true
        config.save!
        expected_params = [[survey_response], active_phase]
        allow(Export::Xlsx::InputSheetGenerator).to receive(:new).and_return(Export::Xlsx::InputSheetGenerator.new(*expected_params))
        do_request
        expect(Export::Xlsx::InputSheetGenerator).to have_received(:new).with(*expected_params)
        assert_status 200
        expect(xlsx_contents(response_body)).to match([
          {
            sheet_name: active_phase.title_multiloc['en'],
            column_headers: [
              'ID',
              multiselect_field.title_multiloc['en'],
              'Author name',
              'Author email',
              'Author ID',
              'Submitted at',
              'Project',
              'Imported'
            ],
            rows: [
              [
                survey_response.id,
                'Cat;Dog',
                survey_response.author_name,
                survey_response.author.email,
                survey_response.author_id,
                an_instance_of(DateTime), # created_at
                project.title_multiloc['en'],
                'false'
              ]
            ]
          }
        ])
      end
    end
  end
end
