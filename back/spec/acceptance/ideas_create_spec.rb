require 'rails_helper'
require 'rspec_api_documentation/dsl'

def define_title_multiloc_param(context)
  context.parameter :title_multiloc, 'Multi-locale field with the idea title', scope: :idea, required: true
end

def public_input_params(context)
  define_title_multiloc_param(context)
  context.parameter :body_multiloc, 'Multi-locale field with the idea body', scope: :idea, extra: 'Required if not draft'
  context.parameter :topic_ids, 'Array of ids of the associated topics', scope: :idea
  context.parameter :cosponsor_ids, 'Array of ids of the desired cosponsors', scope: :idea
  context.parameter :location_point_geojson, 'A GeoJSON point that situates the location the idea applies to', scope: :idea
  context.parameter :location_description, 'A human readable description of the location the idea applies to', scope: :idea
  context.parameter :idea_images_attributes, 'an array of base64 images to create', scope: :idea
  context.parameter :idea_files_attributes, 'an array of base64 files to create', scope: :idea
end

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  before do
    header 'Content-Type', 'application/json'
    create(:idea_status_proposed)
  end

  post 'web_api/v1/ideas' do
    with_options scope: :idea do
      parameter :project_id, 'The identifier of the project that hosts the idea', required: true
      parameter :phase_ids, 'The phases the idea is part of, defaults to the current only, only allowed by admins'
      parameter :author_id, 'The user id of the user owning the idea. This can only be specified by moderators and is inferred from the JWT token for residents.'
      parameter :publication_status, 'Publication status', required: true, extra: "One of #{Idea::PUBLICATION_STATUSES.join(',')}"
      parameter :anonymous, 'Post this idea anonymously'
      parameter :custom_field_name1, 'A value for one custom field'
    end
    ValidationErrorHelper.new.error_fields self, Idea
    response_field :ideas_phases, "Array containing objects with signature { error: 'invalid' }", scope: :errors
    response_field :base, "Array containing objects with signature { error: #{Permissions::PhasePermissionsService::POSTING_DENIED_REASONS.values.join(' | ')} }", scope: :errors

    let(:project_id) { project.id }

    context 'in an ideation phase' do
      public_input_params(self)
      with_options scope: :idea do
        parameter :proposed_budget, 'The budget needed to realize the idea, as proposed by the author'
        parameter :budget, 'The budget needed to realize the idea, as determined by the city'
      end

      let(:publication_status) { 'published' }
      let(:with_permissions) { false }
      let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: with_permissions }) }
      let(:idea) { build(:idea) }
      let(:title_multiloc) { idea.title_multiloc }
      let(:body_multiloc) { idea.body_multiloc }

      context 'when visitor' do
        describe 'default permissions' do
          let(:author_id) { nil }

          example '[error] Create an idea without author', document: false do
            do_request
            assert_status 401
          end
        end
      end

      context 'when resident' do
        before { header_token_for(resident) }

        let(:resident) { create(:user) }
        let(:topic_ids) { create_list(:topic, 2, projects: [project]).map(&:id) }
        let(:location_point_geojson) { { type: 'Point', coordinates: [51.11520776293035, 3.921154106874878] } }
        let(:location_description) { 'Stanley Road 4' }

        example_request 'Create an idea' do
          assert_status 201
          expect(response_data.dig(:relationships, :project, :data, :id)).to eq project_id
          expect(response_data.dig(:relationships, :topics, :data).pluck(:id)).to match_array topic_ids
          expect(response_data.dig(:attributes, :location_point_geojson)).to eq location_point_geojson
          expect(response_data.dig(:attributes, :location_description)).to eq location_description
          expect(project.reload.ideas_count).to eq 1
        end

        example 'Check for the automatic creation of a like by the author when an idea is created', document: false do
          do_request
          assert_status 201
          new_idea = Idea.find(response_data[:id])
          expect(new_idea.reactions.size).to eq 1
          expect(new_idea.reactions[0].mode).to eq 'up'
          expect(new_idea.reactions[0].user.id).to eq resident.id
          expect(response_data[:attributes][:likes_count]).to eq 1
        end

        describe 'Values for disabled fields are ignored' do
          let(:proposed_budget) { 12_345 }

          example 'Create an idea with values for disabled fields', document: false do
            do_request
            assert_status 201
            expect(response_data.dig(:attributes, :title_multiloc, :en)).to eq 'Plant more trees'
            # proposed_budget is disabled, so its given value was ignored.
            expect(response_data.dig(:attributes, :proposed_budget)).to be_nil
            expect(response_data.dig(:relationships, :topics, :data).pluck(:id)).to match_array topic_ids
            expect(response_data.dig(:attributes, :location_point_geojson)).to eq location_point_geojson
            expect(response_data.dig(:attributes, :location_description)).to eq location_description
          end
        end

        describe 'when posting an idea in an active ideation phase, the correct form is used' do
          let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
          let(:proposed_budget) { 1234 }

          example 'Post an idea in an ideation phase', document: false do
            custom_form.custom_fields.find_by(code: 'proposed_budget').update!(enabled: true)

            do_request

            assert_status 201
            idea = Idea.find(response_data[:id])
            expect(idea.proposed_budget).to eq 1234
          end
        end

        describe 'when posting an idea in an active ideation phase, the creation_phase is not set' do
          let!(:custom_form) { create(:custom_form, participation_context: project) }

          example 'Post an idea in an ideation phase', document: false do
            do_request

            assert_status 201
            json_response = json_parse response_body
            idea = Idea.find(json_response.dig(:data, :id))
            expect(idea.creation_phase).to be_nil
          end
        end

        describe 'Creating an idea anonymously' do
          let(:allow_anonymous_participation) { true }
          let(:anonymous) { true }

          before { project.phases.first.update! allow_anonymous_participation: allow_anonymous_participation }

          example_request 'Posting an idea anonymously does not save an author id' do
            assert_status 201
            expect(response_data.dig(:attributes, :anonymous)).to be true
            expect(response_data.dig(:attributes, :author_name)).to be_nil
            expect(response_data.dig(:relationships, :author, :data)).to be_nil
          end

          example 'Does not add the author as a follower', document: false do
            expect { do_request }.not_to change(Follower, :count)
          end

          example 'Does not log activities for the author', document: false do
            expect { do_request }.not_to have_enqueued_job(LogActivityJob).with(anything, anything, resident, anything, anything)
          end

          describe 'when anonymous posting is not allowed' do
            let(:allow_anonymous_participation) { false }

            example_request 'Rejects the anonymous parameter' do
              assert_status 422
              json_response = json_parse response_body
              expect(json_response).to include_response_error(:base, 'anonymous_participation_not_allowed')
            end
          end

          describe 'when anonymous posting is not allowed and project is restricted to groups' do
            before do
              group = create(:group)
              project.update!(visible_to: 'groups', groups: [group])
              resident.update!(manual_groups: [group])
            end

            example_request 'Posting an idea anonymously to a group restricted project' do
              assert_status 201
              expect(response_data.dig(:attributes, :anonymous)).to be true
              expect(response_data.dig(:attributes, :author_name)).to be_nil
              expect(response_data.dig(:relationships, :author, :data)).to be_nil
            end
          end
        end

        describe 'For projects without ideas_order' do
          let(:project) { create(:single_phase_ideation_project, phase_attrs: { ideas_order: nil }) }

          example 'Creates an idea', document: false do
            do_request
            assert_status 201
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
            expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
            expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
            expect(json_response.dig(:data, :attributes, :location_description)).to eq location_description
            expect(project.reload.ideas_count).to eq 1
          end
        end

        describe 'Errors' do
          describe do
            let(:publication_status) { 'fake_status' }

            example_request '[error] Creating an invalid idea' do
              assert_status 422
              json_response = json_parse response_body
              expect(json_response).to include_response_error(:publication_status, 'inclusion', value: 'fake_status')
            end
          end

          describe do
            let(:idea_image) { file_as_base64 'header.jpg', 'image/jpeg' }
            let(:idea_images_attributes) { [{ image: idea_image }] }

            example_request 'Create an idea with an image' do
              assert_status 201
              json_response = json_parse(response_body)
              expect(json_response.dig(:data, :relationships, :idea_images)).to be_present
            end
          end

          describe do
            let(:idea_files_attributes) { [{ name: 'afvalkalender.pdf', file: encode_file_as_base64('afvalkalender.pdf') }] }

            example_request 'Create an idea with a file' do
              assert_status 201
              json_response = json_parse(response_body)
              expect(Idea.find(json_response.dig(:data, :id)).idea_files.size).to eq 1
            end
          end

          describe do
            let(:project) do
              create(:project_with_current_phase, current_phase_attrs: {
                participation_method: 'information'
              })
            end

            example_request '[error] Creating an idea in a project with an active information phase' do
              assert_status 401
              json_response = json_parse(response_body)
              expect(json_response.dig(:errors, :base).first[:error]).to eq 'posting_not_supported'
            end
          end

          describe do
            let(:project_id) { nil }

            example_request '[error] Create an idea without a project' do
              expect(response_status).to be >= 400
            end
          end

          example '[error] Create an idea when there is a posting disabled reason' do
            expect_any_instance_of(Permissions::ProjectPermissionsService)
              .to receive(:denied_reason_for_action).with('posting_idea').and_return('i_dont_like_you')

            do_request

            assert_status 401
            expect(json_parse(response_body)).to include_response_error(:base, 'i_dont_like_you')
          end
        end

        example_group 'with permissions on phase' do
          let(:with_permissions) { true }
          let(:group) { create(:group) }

          before do
            project.phases.first.permissions.find_by(action: 'posting_idea')
              .update!(permitted_by: 'users', groups: [group])
          end

          example '[error] Create an idea in a project with groups posting permission', document: false do
            do_request
            assert_status 401
          end

          example 'Create an idea in a project with groups posting permission', document: false do
            group.add_member(resident).save!
            do_request
            assert_status 201
          end
        end

        describe do
          before { SettingsService.new.activate_feature! 'blocking_profanity' }

          let(:title_multiloc) { { 'nl-BE' => 'Fuck' } }
          let(:body_multiloc) { { 'fr-FR' => 'cocksucker' } }

          example_request '[error] Create an idea with blocked words' do
            assert_status 422
            json_response = json_parse(response_body)
            blocked_error = json_response.dig(:errors, :base)&.select { |err| err[:error] == 'includes_banned_words' }&.first
            expect(blocked_error).to be_present
            expect(blocked_error[:blocked_words].pluck(:attribute).uniq).to include('title_multiloc', 'body_multiloc')
          end
        end
      end

      context 'when admin' do
        before { admin_header_token }

        parameter :idea_status_id, 'The status of the idea, only allowed for admins', scope: :idea, extra: "Defaults to status with code 'proposed'"
        parameter :assignee_id, 'The user id of the admin that takes ownership. Set automatically if not provided. Only allowed for admins.', scope: :idea # Tested in separate engine

        let(:location_point_geojson) { { type: 'Point', coordinates: [51.11520776293035, 3.921154106874878] } }

        describe do
          let(:project) { create(:project_with_current_phase, phases_config: { sequence: 'xxcx' }) }
          let(:phase_ids) { project.phase_ids.take(1) }

          example_request 'Creating an idea in specific (inactive) phases' do
            assert_status 201
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :relationships, :phases, :data).pluck(:id)).to match_array phase_ids
          end
        end

        describe 'when posting an idea in an ideation phase, the form of the project is used for accepting the input' do
          let!(:custom_form) do
            create(:custom_form, :with_default_fields, participation_context: project).tap do |form|
              fields = IdeaCustomFieldsService.new(form).all_fields
              # proposed_budget is disabled by default
              enabled_field_keys = %w[title_multiloc body_multiloc proposed_budget]
              fields.each do |field|
                field.enabled = enabled_field_keys.include? field.code
                field.save!
              end
            end
          end
          let(:phase_ids) { project.phase_ids.take(1) }
          let(:title_multiloc) { { 'nl-BE' => 'An idea with a proposed budget' } }
          let(:body_multiloc) { { 'nl-BE' => 'An idea with a proposed budget for testing' } }
          let(:proposed_budget) { 1234 }

          example 'Post an idea in an ideation phase', document: false do
            do_request

            assert_status 201
            json_response = json_parse response_body
            # Enabled fields have a value
            expect(json_response.dig(:data, :attributes, :title_multiloc)).to eq({ 'nl-BE': 'An idea with a proposed budget' })
            expect(json_response.dig(:data, :attributes, :body_multiloc)).to eq({ 'nl-BE': 'An idea with a proposed budget for testing' })
            expect(json_response.dig(:data, :attributes, :proposed_budget)).to eq proposed_budget
            # Disabled fields do not have a value
            expect(json_response.dig(:data, :attributes, :budget)).to be_nil
            expect(json_response.dig(:data, :attributes, :location_description)).to be_nil
            expect(json_response.dig(:data, :attributes)).not_to have_key :topic_ids
            expect(json_response.dig(:data, :attributes)).not_to have_key :idea_images_attributes
            expect(json_response.dig(:data, :attributes)).not_to have_key :idea_files_attributes
            # location_point_geojson is not a field and cannot be disabled, so it has a value
            expect(json_response.dig(:data, :attributes, :location_point_geojson)).to eq location_point_geojson
          end
        end

        describe 'when posting an idea in an ideation phase, the creation_phase is not set' do
          let!(:custom_form) { create(:custom_form, participation_context: project) }
          let(:phase_ids) { project.phase_ids.take(1) }

          example 'Post an idea in an ideation phase', document: false do
            do_request
            assert_status 201
            json_response = json_parse response_body
            idea = Idea.find(json_response.dig(:data, :id))
            expect(idea.creation_phase).to be_nil
          end
        end

        describe do
          let(:other_project) { create(:project_with_active_ideation_phase) }
          let(:phase_ids) { other_project.phase_ids.take(1) }

          example_request '[error] Creating an idea linked to a phase from a different project', document: false do
            do_request

            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:ideas_phases, 'invalid')
          end
        end
      end
    end

    context 'in a proposals phase' do
      public_input_params(self)
      with_options scope: :idea do
        parameter :cosponsor_ids, 'Array of user ids of the desired cosponsors'
      end

      let(:with_permissions) { false }
      let(:phase) { create(:proposals_phase, with_permissions: with_permissions) }
      let(:project) { phase.project }
      let(:creation_phase_id) { phase.id }
      let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: phase) }
      let(:input) { build(:proposal, project: project) }
      let(:title_multiloc) { { 'en' => 'My proposal title' } }
      let(:body_multiloc) { { 'en' => 'My proposal body' } }
      let(:topic_ids) { [create(:topic, projects: [project]).id] }
      let(:cosponsors) { create_list(:user, 2) }
      let(:cosponsor_ids) { cosponsors.map(&:id) }
      let!(:proposed_status) { create(:proposals_status, code: 'proposed') }
      let!(:prescreening_status) { create(:proposals_status, code: 'prescreening') }

      before do
        CustomField.find_by(code: 'cosponsor_ids').update!(enabled: true)
      end

      context 'when visitor' do
        example '[error] Create a proposal', document: false do
          do_request
          assert_status 401
        end
      end

      context 'when resident' do
        before { header_token_for(resident) }

        let(:resident) { create(:user) }
        let(:with_permissions) { true }
        let(:group) { create(:group) }

        example 'Publish a proposal when permitted (group membership)', document: false do
          group.add_member(resident).save!
          project.phases.first.permissions.find_by(action: 'posting_idea').update!(permitted_by: 'users', groups: [group])
          do_request

          assert_status 201
          input = Idea.find json_parse(response_body).dig(:data, :id)
          expect(input.reload.idea_status).to eq proposed_status
          expect(input.publication_status).to eq 'published'
          expect(input.published_at).to be_present
        end

        describe 'when reviewing is enabled' do
          before { phase.update!(prescreening_enabled: true) }

          example 'Submit a proposal in prescreening', document: false do
            do_request
            assert_status 201
            input = Idea.find json_parse(response_body).dig(:data, :id)
            expect(input.reload.idea_status).to eq prescreening_status
            expect(input.publication_status).to eq 'submitted'
            expect(input.submitted_at).to be_present
            expect(input.published_at).to be_nil
          end
        end

        example '[error] Create a proposal when not permitted (group membership)', document: false do
          project.phases.first.permissions.find_by(action: 'posting_idea').update!(permitted_by: 'users', groups: [group])
          do_request

          assert_status 401
        end
      end

      context 'when admin' do
        before { admin_header_token }

        parameter :idea_status_id, 'The status of the input, only allowed for admins', scope: :idea, extra: "Defaults to status with code 'proposed'" # TODO: proposal statuses
        parameter :assignee_id, 'The user id of the admin that takes ownership. Set automatically if not provided. Only allowed for admins.', scope: :idea # Tested in separate engine

        example_request 'Create a proposal' do
          assert_status 201
          json_response = json_parse(response_body)

          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to eq title_multiloc
          expect(json_response.dig(:data, :attributes, :body_multiloc).stringify_keys).to eq body_multiloc
          expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
          expect(json_response.dig(:data, :relationships, :cosponsors, :data).pluck(:id)).to match_array cosponsor_ids
        end
      end
    end

    context 'in a native survey phase' do
      let(:project) { create(:single_phase_native_survey_project, default_assignee_id: create(:admin).id) }
      let(:idea) { build(:native_survey_response, project: project) }

      context 'when visitor' do
        describe "native survey response when permission is 'everyone'" do
          let(:project) do
            create(:single_phase_native_survey_project, phase_attrs: { with_permissions: true }).tap do |project|
              project.phases.first.permissions.find_by(action: 'posting_idea').update! permitted_by: 'everyone'
            end
          end
          let(:project_id) { project.id }
          let(:extra_field_name) { 'custom_field_name1' }
          let(:form) { create(:custom_form, participation_context: project.phases.first) }
          let!(:text_field) { create(:custom_field_text, key: extra_field_name, required: true, resource: form) }
          let(:custom_field_name1) { 'test value' }

          example_request 'Create a native survey response without author' do
            assert_status 201
            json_response = json_parse response_body
            idea_from_db = Idea.find(json_response[:data][:id])
            expect(idea_from_db.author_id).to be_nil
            expect(idea_from_db.custom_field_values.to_h).to eq({
              extra_field_name => 'test value'
            })
          end
        end
      end

      context 'when resident' do
        before { header_token_for(resident) }

        let(:resident) { create(:user) }

        example 'does not assign anyone to the created idea', document: false do
          do_request
          assert_status 201
          idea = Idea.find(json_parse(response_body).dig(:data, :id))
          expect(idea.assignee_id).to be_nil
          expect(idea.assigned_at).to be_nil
        end

        context 'creating a draft survey response' do
          let(:publication_status) { 'draft' }

          example 'sets the publication status to draft' do
            do_request
            assert_status 201
            idea = Idea.find(json_parse(response_body).dig(:data, :id))
            expect(idea.publication_status).to eq 'draft'
          end
        end

        describe 'Creating a native survey response when posting anonymously is enabled' do
          let(:project) { create(:single_phase_native_survey_project, phase_attrs: { allow_anonymous_participation: true }) }

          example_request 'Posting a survey automatically sets anonymous to true' do
            assert_status 201
            expect(response_data.dig(:attributes, :anonymous)).to be true
            expect(response_data.dig(:attributes, :author_name)).to be_nil
            expect(response_data.dig(:relationships, :author, :data)).to be_nil
          end
        end

        describe 'Creating a native survey response when posting anonymously is not enabled' do
          let(:project) { create(:single_phase_native_survey_project, phase_attrs: { allow_anonymous_participation: false }) }

          example_request 'Posting a survey does not set the survey to anonymous' do
            assert_status 201
            expect(response_data.dig(:attributes, :anonymous)).to be false
            expect(response_data.dig(:attributes, :author_name)).not_to be_nil
            expect(response_data.dig(:relationships, :author, :data)).not_to be_nil
          end
        end
      end
    end

    context 'in a community monitor survey phase' do
      let(:phase) do
        phase = create(:community_monitor_survey_phase, with_permissions: true)
        phase.permissions.find_by(action: 'posting_idea').update!(permitted_by: 'everyone', everyone_tracking_enabled: true)
        phase
      end
      let(:project) do
        project = phase.project
        project.update! default_assignee_id: create(:admin).id
        project
      end

      let(:extra_field_name) { 'custom_field_name1' }
      let(:form) { create(:custom_form, participation_context: phase) }
      let!(:text_field) { create(:custom_field_text, key: extra_field_name, required: true, resource: form) }
      let(:custom_field_name1) { 'test value' }

      context "when visitor (permission is 'everyone')" do
        before { phase.permissions.find_by(action: 'posting_idea').update! permitted_by: 'everyone' }

        context 'No existing response' do
          example_request 'Create a community monitor survey response without author' do
            assert_status 201
            idea_from_db = Idea.find(response_data[:id])
            expect(idea_from_db.author_id).to be_nil
            expect(idea_from_db.custom_field_values.to_h).to eq({
              extra_field_name => 'test value'
            })
          end
        end

        context 'response has already been submitted' do
          let!(:author_hash) do
            # No consent hash based on ip and user agent
            user_agent = 'User-Agent: Mozilla/5.0'
            ip = '1.2.3.4'
            "n_#{Idea.create_author_hash(ip + user_agent, project.id, true)}"
          end
          let!(:response) { create(:native_survey_response, project: project, creation_phase: phase, author: nil, author_hash: author_hash) }

          context 'no cookie present - using headers' do
            example 'does not allow posting if submitted within 3 months' do
              response.update!(published_at: 2.months.ago)
              header 'User-Agent', 'User-Agent: Mozilla/5.0'
              header 'X-Forwarded-For', '1.2.3.4'
              do_request
              assert_status 401
              expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'posting_limited_max_reached'
            end

            example 'allows posting again if submitted after 3 months' do
              response.update!(published_at: 4.months.ago)
              header 'User-Agent', 'User-Agent: Mozilla/5.0'
              header 'X-Forwarded-For', '1.2.3.4'
              do_request
              assert_status 201
            end
          end

          context 'cookie is present' do
            let!(:author_hash) { 'LOGGED_OUT_HASH' }

            example 'does not allow posting if user submitted survey without cookie consent (empty cookie present)' do
              header('Cookie', "#{phase.id}={}")
              do_request
              assert_status 401
              expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'posting_limited_max_reached'
            end

            example 'does not allow posting if submitted within 3 months' do
              response.update!(published_at: 2.months.ago)
              header('Cookie', "#{phase.id}={\"lo\": \"LOGGED_OUT_HASH\"};cl2_consent={\"analytics\": true}")
              do_request
              assert_status 401
              expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'posting_limited_max_reached'
            end

            example 'allows posting again if submitted after 3 months' do
              response.update!(published_at: 4.months.ago)
              header('Cookie', "#{phase.id}={\"lo\": \"LOGGED_OUT_HASH\"};cl2_consent={\"analytics\": true}")
              do_request
              assert_status 201
              # Saves a new idea with the same author hash from the cookie
              expect(Idea.all.pluck(:author_hash)).to match_array %w[LOGGED_OUT_HASH LOGGED_OUT_HASH]

              # Check that the cookie is written in the response
              expect(response_headers['Set-Cookie']).to include("#{phase.id}=%7B%22lo%22%3D%3E%22LOGGED_OUT_HASH%22%7D")
            end

            example 'Uses the logged in author hash over the logged out hash to create the new idea' do
              response.update!(published_at: 4.months.ago)
              header('Cookie', "#{phase.id}={\"lo\": \"LOGGED_OUT_HASH\", \"li\": \"LOGGED_IN_HASH\"};cl2_consent={\"analytics\": true}")
              do_request
              assert_status 201
              # Saves a new idea with the last author hash from the cookie
              expect(Idea.all.pluck(:author_hash)).to match_array %w[LOGGED_OUT_HASH LOGGED_IN_HASH]
            end
          end
        end
      end

      context 'when resident' do
        let(:resident) { create(:user) }

        before { header_token_for(resident) }

        example_request 'does not assign anyone to the created idea', document: false do
          assert_status 201
          idea = Idea.find(response_data[:id])
          expect(idea.assignee_id).to be_nil
          expect(idea.assigned_at).to be_nil
        end

        context 'creating a draft community monitor survey response' do
          let(:publication_status) { 'draft' }

          example_request 'sets the publication status to draft' do
            assert_status 201
            idea = Idea.find(response_data[:id])
            expect(idea.publication_status).to eq 'draft'
          end
        end

        context 'response has already been submitted' do
          example 'does not allow posting if submitted within 3 months' do
            create(:native_survey_response, project: project, creation_phase: phase, author: resident, published_at: 2.months.ago)
            do_request
            assert_status 401
            expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'posting_limited_max_reached'
          end

          example 'allows posting again if submitted after 3 months' do
            create(:native_survey_response, project: project, creation_phase: phase, author: resident, published_at: 4.months.ago)
            do_request
            assert_status 201
          end
        end

        context 'Creating a community monitor survey response when posting anonymously is enabled' do
          before { phase.update! allow_anonymous_participation: true }

          example_request 'Posting a survey automatically sets anonymous to true' do
            assert_status 201
            expect(response_data.dig(:attributes, :anonymous)).to be true
            expect(response_data.dig(:attributes, :author_name)).to be_nil
            expect(response_data.dig(:relationships, :author, :data)).to be_nil
          end

          context 'response has already been submitted' do
            let!(:response) do
              author_hash = Idea.create_author_hash(resident.id, phase.project_id, true)
              create(:native_survey_response, project: project, creation_phase: phase, author: nil, author_hash: author_hash)
            end

            example 'does not allow posting if submitted within 3 months' do
              response.update!(published_at: 2.months.ago)
              do_request
              assert_status 401
              expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'posting_limited_max_reached'
            end

            example 'allows posting if submitted after 3 months' do
              response.update!(published_at: 4.months.ago)
              do_request
              assert_status 201
            end
          end
        end

        context 'Creating a community monitor survey response when posting anonymously is not enabled' do
          before { phase.update! allow_anonymous_participation: false }

          example_request 'Posting a survey does not set the survey to anonymous' do
            assert_status 201
            expect(response_data.dig(:attributes, :anonymous)).to be false
            expect(response_data.dig(:attributes, :author_name)).not_to be_nil
            expect(response_data.dig(:relationships, :author, :data)).not_to be_nil
          end
        end
      end
    end

    context 'in a common ground phase' do
      define_title_multiloc_param(self)

      let(:phase) { create(:common_ground_phase, :ongoing, with_permissions: true) }
      let(:project) { phase.project }

      let(:idea_attrs) { attributes_for(:idea) }
      let(:title_multiloc) { idea_attrs[:title_multiloc] }
      let(:body_multiloc) { idea_attrs[:body_multiloc] }
      let(:publication_status) { 'published' }

      context 'when visitor' do
        example_request '[Unauthorized] Cannot create a common-ground input' do
          assert_status 401
          expect(json_response_body)
            .to match(errors: { base: [{ error: 'posting_not_supported' }] })
        end
      end

      context 'when regular user' do
        before { header_token_for(user) }

        let(:user) { create(:user) }

        example_request '[Unauthorized] Cannot create a common-ground input' do
          assert_status 401
          expect(json_response_body)
            .to match(errors: { base: [{ error: 'posting_not_supported' }] })
        end
      end

      context 'when admin-like' do
        before { admin_header_token }

        let(:phase_ids) { [phase.id] }

        example 'Create a common-ground input' do
          expect { do_request }
            .to change(Idea, :count).by(1)
            .and not_change(Reaction, :count)

          assert_status 201

          expect(response_data[:attributes].with_indifferent_access).to include(
            title_multiloc: title_multiloc,
            body_multiloc: {},
            publication_status: 'published'
          )
        end
      end
    end
  end
end

def encode_file_as_base64(filename)
  "data:application/pdf;base64,#{Base64.encode64(Rails.root.join('spec', 'fixtures', filename).read)}"
end
