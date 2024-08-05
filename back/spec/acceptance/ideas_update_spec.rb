require 'rails_helper'
require 'rspec_api_documentation/dsl'

def public_input_params(spec)
  spec.parameter :title_multiloc, 'Multi-locale field with the idea title', extra: 'Maximum 100 characters', scope: :idea
  spec.parameter :body_multiloc, 'Multi-locale field with the idea body', extra: 'Required if not draft', scope: :idea
  spec.parameter :topic_ids, 'Array of ids of the associated topics', scope: :idea
  spec.parameter :location_point_geojson, 'A GeoJSON point that situates the location the idea applies to', scope: :idea
  spec.parameter :location_description, 'A human readable description of the location the idea applies to', scope: :idea
  spec.parameter :idea_images_attributes, 'an array of base64 images to create', scope: :idea
  spec.parameter :idea_files_attributes, 'an array of base64 files to create', scope: :idea
end

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  before { header 'Content-Type', 'application/json' }

  patch 'web_api/v1/ideas/:id' do
    with_options scope: :idea do
      parameter :project_id, 'The idea of the project that hosts the idea'
      parameter :phase_ids, 'The phases the idea is part of, defaults to the current only, only allowed by admins'
      parameter :author_id, 'The user id of the user owning the idea. This can only be specified by moderators and is inferred from the JWT token for residents.'
      parameter :publication_status, "Either #{Post::PUBLICATION_STATUSES.join(', ')}"
      parameter :anonymous, 'Post this idea anonymously'
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
    response_field :base, "Array containing objects with signature { error: #{Permissions::PhasePermissionsService::POSTING_DENIED_REASONS.values.join(' | ')} }", scope: :errors

    let(:id) { input.id }

    context 'in an ideation phase' do
      public_input_params(self)
      with_options scope: :idea do
        parameter :proposed_budget, 'The budget needed to realize the idea, as proposed by the author'
        parameter :budget, 'The budget needed to realize the idea, as determined by the city'
      end

      let(:with_permissions) { false }
      let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: with_permissions }) }
      let(:input) { create(:idea, project: project, phases: project.phases) }

      context 'when author' do
        before { header_token_for(author) }

        let(:author) { input.author }

        let(:location_point_geojson) { { type: 'Point', coordinates: [51.4365635, 3.825930459] } }
        let(:location_description) { 'Watkins Road 8' }
        let(:title_multiloc) { { 'en' => 'Changed title' } }
        let(:topic_ids) { create_list(:topic, 2, projects: [project]).map(&:id) }

        example_request 'Update an idea' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
          expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
          expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
          expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
        end

        describe do
          let(:publication_status) { 'published' }

          example_request 'Change the publication status' do
            assert_status 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :attributes, :publication_status)).to eq 'published'
          end
        end

        describe do
          let(:idea_status_id) { create(:idea_status).id }

          example '[error] Change the idea status', document: false do
            do_request
            assert_status 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :idea_status, :data, :id)).to eq input.idea_status_id
          end
        end

        example 'Check for the automatic creation of a like by the author when the publication status of an idea is updated from draft to published', document: false do
          input.update! publication_status: 'draft'
          do_request idea: { publication_status: 'published' }
          json_response = json_parse response_body
          new_idea = Idea.find json_response.dig(:data, :id)
          expect(new_idea.reactions.size).to eq 1
          expect(new_idea.reactions[0].mode).to eq 'up'
          expect(new_idea.reactions[0].user.id).to eq author.id
          expect(json_response.dig(:data, :attributes, :likes_count)).to eq 1
        end

        example '[error] Update an idea when there is a posting disabled reason' do
          expect_any_instance_of(Permissions::ProjectPermissionsService)
            .to receive(:denied_reason_for_action).with('posting_idea').and_return('i_dont_like_you')

          do_request

          assert_status 401
          expect(json_parse(response_body)).to include_response_error(:base, 'i_dont_like_you')
        end

        describe 'Values for disabled fields are ignored' do
          let(:proposed_budget) { 12_345 }

          example 'Update an idea with values for disabled fields', document: false do
            do_request
            assert_status 200
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
            # proposed_budget is disabled, so its given value was ignored.
            expect(json_response.dig(:data, :attributes, :proposed_budget)).to eq input.proposed_budget
            expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
            expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
            expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
          end
        end

        describe do
          let(:topic_ids) { [] }

          example 'Remove the topics', document: false do
            input.topics = create_list :topic, 2
            do_request
            assert_status 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
          end
        end

        describe do
          let(:previous_budget) { input.budget }
          let(:budget) { previous_budget + 10 }

          example '[error] Change the participatory budget', document: false do
            do_request
            assert_status 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :attributes, :budget)).to eq previous_budget
          end
        end

        describe 'Changing an idea to anonymous' do
          let(:anonymous) { true }

          before { project.phases.first.update! allow_anonymous_participation: true }

          example 'Change an idea to anonymous as a non-admin', document: false do
            do_request
            assert_status 200
            expect(response_data.dig(:attributes, :anonymous)).to be true
          end
        end

        describe 'Changing an author' do
          let(:author_id) { create(:user).id }

          example 'author_id parameter is ignored as a non-admin', document: false do
            do_request
            assert_status 200
            expect(response_data.dig(:relationships, :author, :data, :id)).not_to eq author_id
          end
        end
      end

      context 'when admin' do
        with_options scope: :idea do
          parameter :idea_status_id, 'The status of the idea, only allowed for admins'
          parameter :assignee_id, 'The user id of the admin that takes ownership. Only allowed for admins.' # Tested in separate engine
        end

        before { header_token_for(admin) }

        let(:admin) { create(:admin) }

        describe do
          before do
            project.update! allowed_input_topics: create_list(:topic, 2)
            input.update! topics: project.allowed_input_topics
          end

          let(:project_id) { create(:project, allowed_input_topics: [project.allowed_input_topics.first]).id }

          example_request 'Change the project' do
            assert_status 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id

            expect(input.reload).to be_valid
          end
        end

        example '[error] Removing the author of a published idea', document: false do
          input.update! publication_status: 'published'
          do_request idea: { author_id: nil }
          assert_status 422
          expect(json_response_body).to include_response_error(:author, 'blank')
        end

        example '[error] Publishing an idea without author', document: false do
          input.update! publication_status: 'draft', author: nil
          do_request idea: { publication_status: 'published' }
          assert_status 422
          expect(json_response_body).to include_response_error(:author, 'blank')
        end

        describe 'draft ideas' do
          before { input.update! publication_status: 'draft' }

          context 'Editing an idea' do
            let(:title_multiloc) { { 'en' => 'Changed the title' } }

            example_request 'Can edit a draft idea' do
              assert_status 200
              expect(response_data[:attributes][:publication_status]).to eq 'draft'
              expect(response_data[:attributes][:title_multiloc][:en]).to eq 'Changed the title'
            end
          end

          context 'Publishing an idea' do
            let(:publication_status) { 'published' }

            example_request 'Can change an idea from draft to published' do
              assert_status 200
              expect(response_data[:attributes][:publication_status]).to eq 'published'
            end
          end
        end

        describe do
          let(:idea_status_id) { create(:idea_status).id }
          let(:input) { create(:idea, project: project, phases: project.phases, idea_status: create(:idea_status_proposed)) }
          let(:idea_status_id) { IdeaStatus.find_by(code: 'proposed').id }

          example_request 'Change the idea status' do
            assert_status 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :idea_status, :data, :id)).to eq idea_status_id
          end
        end

        describe 'phase_ids' do
          let(:phase) { project.phases.first }

          context 'when passing some phase ids' do
            let(:phase_ids) { [phase.id] }

            example_request 'Change the idea phases' do
              assert_status 200

              json_response = json_parse response_body
              expect(json_response.dig(:data, :relationships, :phases, :data).pluck(:id)).to match_array phase_ids
            end

            example 'Changes the ideas count of a phase', document: false do
              do_request
              expect(phase.reload.ideas_count).to eq 1
            end
          end

          context 'when passing an empty array of phase ids' do
            let(:phase_ids) { [] }

            example 'Change the idea phases', document: false do
              do_request

              assert_status 200
              json_response = json_parse response_body
              expect(json_response.dig(:data, :relationships, :phases, :data).pluck(:id)).to match_array phase_ids
            end

            example 'Changes the ideas count of a phase when the phases change', document: false do
              do_request
              expect(phase.reload.ideas_count).to eq 0
            end
          end
        end

        describe 'budget' do
          let(:budget) { 1800 }

          example_request 'Change the participatory budget' do
            assert_status 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :attributes, :budget)).to eq budget
          end
        end

        describe 'Changing an idea to anonymous' do
          let(:allow_anonymous_participation) { true }

          before { project.phases.first.update! allow_anonymous_participation: allow_anonymous_participation }

          example 'Updating values of an anonymously posted idea', document: false do
            input.update! publication_status: 'published', anonymous: true, author: nil
            do_request idea: { location_description: 'HERE' }
            assert_status 200
            expect(response_data.dig(:attributes, :location_description)).to eq 'HERE'
          end

          example 'Changing an idea to anonymous', document: false do
            input.update! publication_status: 'published', anonymous: false, author: admin
            do_request idea: { anonymous: true }
            assert_status 200
            expect(response_data.dig(:attributes, :anonymous)).to be true
            expect(response_data.dig(:attributes, :author_name)).to be_nil
          end

          example 'Updating an anonymously posted idea with an author', document: false do
            input.update! publication_status: 'published', anonymous: true, author: nil
            do_request idea: { author_id: admin.id, publication_status: 'published' }
            assert_status 200
            expect(response_data.dig(:relationships, :author, :data, :id)).to eq admin.id
            expect(response_data.dig(:attributes, :anonymous)).to be false
          end

          describe 'when anonymous posting is not allowed' do
            let(:allow_anonymous_participation) { false }

            example 'Rejects the anonymous parameter' do
              do_request idea: { anonymous: true }
              assert_status 422
              json_response = json_parse response_body
              expect(json_response).to include_response_error(:base, 'anonymous_participation_not_allowed')
            end
          end

          example 'Does not log activities for the author', document: false do
            expect { do_request(idea: { anonymous: true }) }.not_to have_enqueued_job(LogActivityJob).with(anything, anything, admin, anything, anything)
          end

          example 'Does not log activities for the author and clears the author from past activities', document: false do
            clear_activity = create(:activity, item: input, user: admin)
            other_item_activity = create(:activity, item: input, user: create(:user))
            other_user_activity = create(:activity, user: admin)

            expect { do_request(idea: { anonymous: true }) }.not_to have_enqueued_job(LogActivityJob).with(anything, anything, admin, anything, anything)
            expect(clear_activity.reload.user_id).to be_nil
            expect(other_item_activity.reload.user_id).to be_present
            expect(other_user_activity.reload.user_id).to eq admin.id
          end
        end
      end

      context 'when moderator' do
        with_options scope: :idea do
          parameter :idea_status_id, 'The status of the idea, only allowed for admins'
          parameter :assignee_id, 'The user id of the admin that takes ownership. Only allowed for admins.' # Tested in separate engine
        end

        before { header_token_for create(:project_moderator, projects: [project]) }

        let(:idea_status_id) { create(:idea_status).id }

        example_request 'Change the idea status' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :relationships, :idea_status, :data, :id)).to eq idea_status_id
        end
      end
    end

    context 'in a proposals phase' do
      public_input_params(self)
      with_options scope: :idea do
        parameter :custom_field_name1, 'A value for one custom field'
        # parameter :cosponsor_ids, 'Array of user ids of the desired cosponsors' # TODO: cosponsors
      end

      let(:input) { create(:proposal) }
      let!(:form) { create(:custom_form, :with_default_fields, participation_context: input.creation_phase) }
      let!(:text_field) { create(:custom_field_text, key: 'custom_field_name1', required: true, resource: form) }
      let(:custom_field_name1) { 'changed value' }

      context 'when author' do
        before { header_token_for(author) }

        let(:author) { input.author }
        let(:title_multiloc) { { 'en' => 'Changed title' } }

        example_request 'Update an initiative' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to eq title_multiloc
          expect(json_response.dig(:data, :attributes, :custom_field_name1)).to eq custom_field_name1
        end

        # TODO: Do not allow changing the project or phases
        # TODO: Update the cosponsors
      end

      context 'when admin' do
        with_options scope: :idea do
          parameter :idea_status_id, 'The status of the idea, only allowed for admins'
          parameter :assignee_id, 'The user id of the admin that takes ownership. Only allowed for admins.' # Tested in separate engine
        end

        before { admin_header_token }

        describe do
          let(:idea_status_id) { create(:proposals_status).id }

          example_request 'Change the idea status' do
            assert_status 200
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :idea_status, :data, :id)).to eq idea_status_id
          end
        end

        describe do
          let(:input) { create(:proposal, idea_status: create(:proposals_status)) }
          let(:idea_status_id) { create(:proposals_status, code: 'threshold_reached').id }

          example '[Error] Manually change the idea status to an automated status', document: false do
            do_request
            expect(input.reload.idea_status.code).not_to eq 'threshold_reached'
          end
        end
      end
    end

    context 'in a native survey phase' do
      let(:project) { create(:single_phase_native_survey_project) }
      let(:author) { create(:user) }
      let(:input) { create(:native_survey_response, project: project, author: author) }

      context 'when author' do
        before { header_token_for(author) }

        describe 'Submitting a final native survey response' do
          before { input.update!(publication_status: 'draft') }

          let(:publication_status) { 'published' }

          example_request 'Can change a survey response from draft to published' do
            assert_status 200
            expect(response_data[:attributes][:publication_status]).to eq 'published'
          end
        end
      end

      context 'when admin' do
        before { admin_header_token }

        describe 'draft ideas' do
          before { input.update! publication_status: 'draft', idea_import: create(:idea_import, idea: input) }

          let(:publication_status) { 'published' }

          example_request 'Can change an an imported native survey response from draft to published' do
            assert_status 200
            expect(response_data[:attributes][:publication_status]).to eq 'published'
          end
        end
      end
    end

    context 'in a voting phase' do
      with_options scope: :idea do
        parameter :title_multiloc, 'Multi-locale field with the idea title', extra: 'Maximum 100 characters'
        parameter :body_multiloc, 'Multi-locale field with the idea body', extra: 'Required if not draft'
        parameter :topic_ids, 'Array of ids of the associated topics'
        parameter :location_point_geojson, 'A GeoJSON point that situates the location the idea applies to'
        parameter :location_description, 'A human readable description of the location the idea applies to'
        parameter :proposed_budget, 'The budget needed to realize the idea, as proposed by the author'
        parameter :budget, 'The budget needed to realize the idea, as determined by the city'
      end

      let(:project) { create(:project_with_past_ideation_and_active_budgeting_phase) }
      let(:input) { create(:idea, project: project, phases: project.phases) }

      context 'when author' do
        before { header_token_for(author) }

        let(:author) { input.author }
        let(:title_multiloc) { { 'en' => 'Changed title' } }

        example '[error] Update an idea', document: false do
          do_request

          assert_status 401
          expect(json_response_body).to include_response_error(:base, 'posting_not_supported')
        end
      end

      context 'when admin' do
        before { admin_header_token }

        context 'Moving the idea from a voting phase' do
          before do
            basket = create(:basket, phase: project.phases.last)
            basket.update!(ideas: [input], submitted_at: Time.zone.now)
            basket.baskets_ideas.update_all(votes: 1)
            basket.update_counts!
          end

          context 'Removing the idea from a voting phase' do
            let(:phase_ids) { project.phase_ids.take(1) }

            example 'Successfully removes the idea from a voting phase and recalculates vote counts', document: false do
              # Voting counts before
              expect(input.ideas_phases.pluck(:votes_count)).to match_array [0, 1]

              do_request
              assert_status 200

              # Voting phase counts after
              expect(input.ideas_phases.pluck(:votes_count)).to match_array [0]
            end
          end

          context 'Add an idea back into a voting phase' do
            let(:phase_ids) { [project.phase_ids.last] }

            example 'Successfully added the idea to the voting phase and restores vote counts', document: false do
              # Voting counts before
              input.update!(phases: [project.phases.first])
              expect(input.ideas_phases.pluck(:votes_count)).to match_array [0]

              do_request
              assert_status 200

              expect(input.ideas_phases.pluck(:votes_count)).to match_array [1]
            end
          end

          context 'Moving to a different project' do
            let(:new_project) { create(:single_phase_ideation_project) }
            let(:project_id) { new_project.id }

            example 'Move the idea to another (non-voting) project', document: false do
              do_request
              assert_status 200
            end
          end
        end
      end
    end
  end
end
