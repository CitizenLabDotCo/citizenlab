# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects' do
  explanation 'Ideas have to be posted in a city project, or they can be posted in the open idea box.'

  let(:json_response) { json_parse(response_body) }

  before do
    header 'Content-Type', 'application/json'
    create(:idea_status_proposed)
  end

  context 'when admin' do
    before do
      @user = create(:admin)
      header_token_for @user

      @projects = %w[published published draft published archived archived published]
        .map { |ps| create(:project, admin_publication_attributes: { publication_status: ps }) }
    end

    get 'web_api/v1/projects' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of projects per page'
      end

      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :publication_statuses, 'Return only projects with the specified publication statuses (i.e. given an array of publication statuses); returns all projects by default', required: false
      parameter :filter_can_moderate, 'Filter out the projects the user is allowed to moderate. False by default', required: false
      parameter :filter_ids, 'Filter out only projects with the given list of IDs', required: false

      parameter :folder, 'Filter by folder (project folder id)', required: false

      example_request 'List all projects (default behaviour)' do
        assert_status 200
        expect(json_response[:data].size).to eq 7
        expect(json_response[:data].map { |d| json_response[:included].find { |x| x[:id] == d.dig(:relationships, :admin_publication, :data, :id) }.dig(:attributes, :publication_status) }.uniq).to match_array %w[published archived draft]
      end

      example 'List only projects with specified IDs' do
        filter_ids = [@projects.first.id, @projects.last.id]
        do_request(filter_ids: filter_ids)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].pluck(:id)).to match_array filter_ids
      end

      example 'List all draft or archived projects', document: false do
        do_request(publication_statuses: %w[draft archived])
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map { |d| json_response[:included].find { |x| x[:id] == d.dig(:relationships, :admin_publication, :data, :id) }.dig(:attributes, :publication_status) }).not_to include('published')
      end

      example 'Get all projects on the second page with fixed page size' do
        do_request({ 'page[number]' => 2, 'page[size]' => 2 })
        expect(status).to eq 200
        expect(json_response[:data].size).to eq 2
      end

      example 'List all projects from a folder' do
        folder = create(:project_folder, projects: @projects.take(2))

        do_request folder: folder.id
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].pluck(:id)).to match_array @projects.take(2).map(&:id)
      end

      example 'List all top-level projects' do
        create(:project_folder, projects: @projects.take(2))

        do_request folder: nil, publication_statuses: AdminPublication::PUBLICATION_STATUSES
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data].pluck(:id)).to match_array @projects.drop(2).map(&:id)
      end

      example 'List all projects with an area' do
        a1 = create(:area)
        a2 = create(:area)

        p1 = @projects.first
        p1.areas << a1
        p1.save!

        p2 = @projects.last
        p2.areas << a2
        p2.save!

        do_request areas: [a1.id], publication_statuses: ['published']

        expect(json_response[:data].size).to eq 1
        expect(json_response[:data].pluck(:id)).to match_array [p1.id]
      end

      example 'List all projects with all given areas', document: false do
        a1 = create(:area)
        a2 = create(:area)
        a3 = create(:area)

        p1 = @projects.first
        p1.areas = [a1, a2]
        p1.save!

        p2 = @projects[1]
        p2.areas = [a2, a3]
        p2.save!

        p3 = @projects[3]
        p3.areas = [a3]
        p3.save!

        do_request areas: [a1.id, a2.id], publication_statuses: ['published']
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].pluck(:id)).to match_array [p1.id, p2.id]
      end

      example 'Admins can moderate all projects', document: false do
        do_request filter_can_moderate: true, publication_statuses: ['published']
        assert_status 200
        expect(json_response[:data].size).to eq 4
      end
    end

    get 'web_api/v1/projects/:id' do
      let(:id) { @projects.first.id }

      example 'Get one project by id' do
        PermissionsService.new.update_all_permissions
        do_request
        assert_status 200

        expect(json_response.dig(:data, :id)).to eq @projects.first.id
        expect(json_response.dig(:data, :type)).to eq 'project'
        expect(json_response.dig(:data, :attributes)).to include(
          slug: @projects.first.slug,
          timeline_active: nil,
          action_descriptor: {
            posting_idea: { enabled: false, disabled_reason: 'project_inactive', future_enabled: nil },
            commenting_idea: { enabled: false, disabled_reason: 'project_inactive' },
            voting_idea: {
              enabled: false,
              disabled_reason: 'project_inactive',
              up: {
                enabled: false,
                disabled_reason: 'project_inactive'
              },
              down: {
                enabled: false,
                disabled_reason: 'project_inactive'
              }
            },
            comment_voting_idea: { enabled: false, disabled_reason: 'project_inactive' },
            taking_survey: { enabled: false, disabled_reason: 'project_inactive' },
            taking_poll: { enabled: false, disabled_reason: 'project_inactive' }
          }
        )
        expect(json_response.dig(:data, :relationships)).to include(
          areas: { data: [] },
          user_basket: { data: nil }
        )
        expect(json_response.dig(:data, :relationships, :permissions, :data).size)
          .to eq Permission.available_actions(@projects.first).length
        expect(json_response[:included].pluck(:type)).to include 'admin_publication', 'permission'
      end

      example 'Get a project with a basket', document: false do
        project = create(:continuous_budgeting_project)
        basket = create(:basket, participation_context: project, user: @user)
        do_request id: project.id
        expect(status).to eq 200
        expect(json_response.dig(:data, :relationships, :user_basket, :data, :id)).to eq basket.id
      end

      example 'Get a project on a timeline project includes the current_phase', document: false do
        project = create(:project_with_current_phase)
        current_phase = project.phases[2]
        do_request id: project.id
        expect(status).to eq 200
        expect(json_response.dig(:data, :relationships, :current_phase, :data, :id)).to eq current_phase.id
        expect(json_response[:included].pluck(:id)).to include(current_phase.id)
      end

      example 'Get a project includes the participants_count and avatars_count', document: false do
        idea = create(:idea)
        project = idea.project
        do_request id: project.id
        expect(status).to eq 200
        expect(json_response.dig(:data, :attributes, :participants_count)).to eq 1
        expect(json_response.dig(:data, :attributes, :avatars_count)).to eq 1
      end
    end

    get 'web_api/v1/projects/by_slug/:slug' do
      let(:slug) { @projects.first.slug }

      example_request 'Get one project by slug' do
        expect(status).to eq 200
        expect(json_response.dig(:data, :id)).to eq @projects.first.id
      end

      describe do
        let(:slug) { 'unexisting-project' }

        example 'Get an unexisting project by slug', document: false do
          do_request
          expect(status).to eq 404
        end
      end
    end

    post 'web_api/v1/projects' do
      with_options scope: :project do
        parameter :process_type, "The type of process used in this project. Can't be changed after. One of #{Project::PROCESS_TYPES.join(',')}. Defaults to timeline"
        parameter :title_multiloc, 'The title of the project, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the project, as a multiloc HTML string', required: true
        parameter :description_preview_multiloc, 'The description preview of the project, as a multiloc string'
        parameter :slug, 'The unique slug of the project. If not given, it will be auto generated'
        parameter :header_bg, 'Base64 encoded header image'
        parameter :area_ids, 'Array of ids of the associated areas'
        parameter :topic_ids, 'Array of ids of the associated topics'
        parameter :visible_to, "Defines who can see the project, either #{Project::VISIBLE_TOS.join(',')}. Defaults to public.", required: false
        parameter :participation_method, "Only for continuous projects. Either #{ParticipationContext::PARTICIPATION_METHODS.join(',')}. Defaults to ideation.", required: false
        parameter :posting_enabled, 'Only for continuous projects. Can citizens post ideas in this project? Defaults to true', required: false
        parameter :posting_method, "Only for continuous projects with posting enabled. How does posting work? Either #{ParticipationContext::POSTING_METHODS.join(',')}. Defaults to unlimited for ideation, and limited to one for native surveys.", required: false
        parameter :posting_limited_max, 'Only for continuous projects with limited posting. Number of posts a citizen can perform in this project. Defaults to 1', required: false
        parameter :commenting_enabled, 'Only for continuous projects. Can citizens post comment in this project? Defaults to true', required: false
        parameter :voting_enabled, 'Only for continuous projects. Can citizens vote in this project? Defaults to true', required: false
        parameter :upvoting_method, "Only for continuous projects with voting enabled. How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}. Defaults to unlimited", required: false
        parameter :upvoting_limited_max, 'Only for continuous projects with limited upvoting. Number of upvotes a citizen can perform in this project. Defaults to 10', required: false
        parameter :downvoting_enabled, 'Only for continuous projects. Can citizens downvote in this project? Defaults to true', required: false
        parameter :downvoting_method, "Only for continuous projects with downvoting enabled. How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}. Defaults to unlimited", required: false
        parameter :downvoting_limited_max, 'Only for continuous projects with limited downvoting. Number of downvotes a citizen can perform in this project. Defaults to 10', required: false
        parameter :survey_embed_url, 'The identifier for the survey from the external API, if participation_method is set to survey', required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyParticipationContext::SURVEY_SERVICES.join(',')}", required: false
        parameter :min_budget, 'The minimum budget amount. Participatory budget should be greater or equal to input.', required: false
        parameter :max_budget, 'The maximal budget amount each citizen can spend during participatory budgeting.', required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{ParticipationContext::PRESENTATION_MODES.join(',')}. Defaults to card.", required: false
        parameter :default_assignee_id, 'The user id of the admin or moderator that gets assigned to ideas by default. Defaults to unassigned', required: false
        parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", required: false
        parameter :ideas_order, 'The default order of ideas.'
        parameter :input_term, 'The input term for posts.'
        parameter :folder_id, 'The ID of the project folder (can be set to nil for top-level projects)', required: false
      end

      with_options scope: %i[project admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the project, either #{AdminPublication::PUBLICATION_STATUSES.join(',')}. Defaults to published.", required: false
      end

      ValidationErrorHelper.new.error_fields(self, Project)

      describe do
        before do
          create(:topic, code: 'nature', ordering: 0)
          create(:topic, code: 'safety', ordering: 2)
          create(:topic, code: 'mobility', ordering: 1)
        end

        let(:project) { build(:project) }
        let(:title_multiloc) { project.title_multiloc }
        let(:description_multiloc) { project.description_multiloc }
        let(:description_preview_multiloc) { project.description_preview_multiloc }
        let(:header_bg) { file_as_base64 'header.jpg', 'image/jpeg' }
        let(:area_ids) { create_list(:area, 2).map(&:id) }
        let(:topic_ids) { create_list(:topic, 2).map(&:id) }
        let(:visible_to) { 'admins' }
        let(:publication_status) { 'draft' }
        let(:default_assignee_id) { create(:admin).id }

        example_request 'Create a timeline project' do
          assert_status 201
          expect(json_response.dig(:data, :attributes, :process_type)).to eq 'timeline'
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data, :attributes, :description_preview_multiloc).stringify_keys).to match description_preview_multiloc
          expect(json_response.dig(:data, :relationships, :areas, :data).pluck(:id)).to match_array area_ids
          expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
          expect(json_response.dig(:data, :attributes, :visible_to)).to eq 'admins'
          expect(json_response[:included].find { |inc| inc[:type] == 'admin_publication' }.dig(:attributes, :publication_status)).to eq 'draft'
          expect(json_response.dig(:data, :relationships, :default_assignee, :data, :id)).to eq default_assignee_id

          expect(json_response.dig(:data, :attributes, :header_bg)).to be_present
          # New projects are added to the top
          expect(json_response[:included].find { |inc| inc[:type] == 'admin_publication' }.dig(:attributes, :ordering)).to eq 0
        end

        example 'Log activities', document: false do
          # It's easier to use a null object instead of a more restrictive spy here
          # because some of the expected jobs are configured before being queued:
          #   LogActivityJob.set(...).perform_later(...)
          stub_const('LogActivityJob', double.as_null_object)

          do_request
          project = Project.find(response_data[:id])

          expect(LogActivityJob).to have_received('perform_later').exactly(2).times

          expect(LogActivityJob)
            .to have_received('perform_later')
            .with(project, 'created', @user, be_a(Numeric))

          expect(LogActivityJob)
            .to have_received('perform_later')
            .with(project, 'draft', @user, be_a(Numeric), payload: [nil, 'draft'])
        end

        example 'Create a project in a folder' do
          folder = create(:project_folder)
          do_request folder_id: folder.id
          assert_status 201
          # New folder projects are added to the top
          expect(json_response[:included].find do |inc|
                   inc[:type] == 'admin_publication'
                 end.dig(:attributes, :ordering)).to eq 0
        end
      end

      describe do
        let(:project) { build(:continuous_project) }
        let(:title_multiloc) { project.title_multiloc }
        let(:description_multiloc) { project.description_multiloc }
        let(:description_preview_multiloc) { project.description_preview_multiloc }
        let(:header_bg) { file_as_base64 'header.jpg', 'image/jpeg' }
        let(:area_ids) { create_list(:area, 2).map(&:id) }
        let(:visible_to) { 'admins' }
        let(:process_type) { project.process_type }
        let(:participation_method) { project.participation_method }
        let(:presentation_mode) { 'map' }
        let(:posting_enabled) { project.posting_enabled }
        let(:posting_method) { 'limited' }
        let(:posting_limited_max) { 5 }
        let(:commenting_enabled) { project.commenting_enabled }
        let(:voting_enabled) { project.voting_enabled }
        let(:upvoting_method) { project.upvoting_method }
        let(:upvoting_limited_max) { project.upvoting_limited_max }
        let(:ideas_order) { 'new' }

        example_request 'Create a continuous project' do
          assert_status 201
          project_id = json_response.dig(:data, :id)
          project_in_db = Project.find(project_id)

          # A new ideation project does not have a default form.
          expect(project_in_db.custom_form).to be_nil

          expect(json_response.dig(:data, :attributes, :process_type)).to eq process_type
          expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
          expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
          expect(json_response.dig(:data, :attributes, :description_preview_multiloc).stringify_keys).to match description_preview_multiloc
          expect(json_response.dig(:data, :relationships, :areas, :data).pluck(:id)).to match_array area_ids
          expect(json_response.dig(:data, :attributes, :visible_to)).to eq visible_to
          expect(json_response.dig(:data, :attributes, :participation_method)).to eq participation_method
          expect(json_response.dig(:data, :attributes, :presentation_mode)).to eq presentation_mode
          expect(json_response.dig(:data, :attributes, :posting_enabled)).to eq posting_enabled
          expect(json_response.dig(:data, :attributes, :posting_method)).to eq posting_method
          expect(json_response.dig(:data, :attributes, :posting_limited_max)).to eq posting_limited_max
          expect(json_response.dig(:data, :attributes, :commenting_enabled)).to eq commenting_enabled
          expect(json_response.dig(:data, :attributes, :voting_enabled)).to eq voting_enabled
          expect(json_response.dig(:data, :attributes, :downvoting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :upvoting_method)).to eq upvoting_method
          expect(json_response.dig(:data, :attributes, :upvoting_limited_max)).to eq upvoting_limited_max
          expect(json_response.dig(:data, :attributes, :ideas_order)).to be_present
          expect(json_response.dig(:data, :attributes, :ideas_order)).to eq 'new'
          expect(json_response.dig(:data, :attributes, :input_term)).to be_present
          expect(json_response.dig(:data, :attributes, :input_term)).to eq 'idea'
        end

        context 'when not admin' do
          before do
            @user.update(roles: [])
          end

          let(:presentation_mode) { 'map' }

          example '[error] Create a project', document: false do
            do_request
            expect(response_status).to eq 401
          end
        end

        describe do
          let(:slug) { 'this-is-taken' }

          example '[error] Create an invalid project', document: false do
            create(:project, slug: 'this-is-taken')
            do_request
            assert_status 422
            expect(json_response).to include_response_error(:slug, 'taken', value: 'this-is-taken')
          end
        end

        describe do
          let(:description_multiloc) do
            {
              'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
            }
          end

          example 'Create a project with text image', document: false do
            ti_count = TextImage.count
            do_request
            assert_status 201
            expect(TextImage.count).to eq(ti_count + 1)
          end

          example '[error] Create a project with text image without title', document: false do
            ti_count = TextImage.count
            do_request project: { title_multiloc: nil }

            assert_status 422
            expect(json_response[:errors][:title_multiloc]).to be_present
            expect(TextImage.count).to eq ti_count
          end
        end
      end

      context 'native survey' do
        let(:project) { build(:continuous_native_survey_project) }
        let(:title_multiloc) { project.title_multiloc }
        let(:description_multiloc) { project.description_multiloc }
        let(:description_preview_multiloc) { project.description_preview_multiloc }
        let(:visible_to) { 'admins' }
        let(:process_type) { project.process_type }
        let(:participation_method) { project.participation_method }

        example 'Create a continuous project', document: false do
          do_request
          assert_status 201
          project_id = json_response.dig(:data, :id)
          project_in_db = Project.find(project_id)

          # A new native survey project has a default form.
          expect(project_in_db.custom_form.custom_fields.size).to eq 2
          field1 = project_in_db.custom_form.custom_fields[0]
          expect(field1.input_type).to eq 'page'
          field2 = project_in_db.custom_form.custom_fields[1]
          expect(field2.title_multiloc).to match({
            'en' => an_instance_of(String),
            'fr-FR' => an_instance_of(String),
            'nl-NL' => an_instance_of(String)
          })
          options = field2.options
          expect(options.size).to eq 2
          expect(options[0].key).to eq 'option1'
          expect(options[1].key).to eq 'option2'
          expect(options[0].title_multiloc).to match({
            'en' => an_instance_of(String),
            'fr-FR' => an_instance_of(String),
            'nl-NL' => an_instance_of(String)
          })
          expect(options[1].title_multiloc).to match({
            'en' => an_instance_of(String),
            'fr-FR' => an_instance_of(String),
            'nl-NL' => an_instance_of(String)
          })

          expect(project_in_db.process_type).to eq 'continuous'
          expect(project_in_db.participation_method).to eq 'native_survey'
          expect(project_in_db.title_multiloc).to match title_multiloc
          expect(project_in_db.description_multiloc).to match description_multiloc
          expect(project_in_db.visible_to).to eq visible_to
          expect(project_in_db.ideas_order).to be_nil

          # A native survey project still has some ideation-related state, all column defaults.
          expect(project_in_db.input_term).to eq 'idea'
          expect(project_in_db.presentation_mode).to eq 'card'
          expect(json_response.dig(:data, :attributes, :posting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :commenting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :voting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :downvoting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :upvoting_method)).to eq 'unlimited'
          expect(json_response.dig(:data, :attributes, :upvoting_limited_max)).to eq 10
        end
      end
    end

    patch 'web_api/v1/projects/:id' do
      before do
        @project = create(:project, process_type: 'continuous')
      end

      with_options scope: :project do
        parameter :title_multiloc, 'The title of the project, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the project, as a multiloc HTML string', required: true
        parameter :description_preview_multiloc, 'The description preview of the project, as a multiloc string'
        parameter :slug, 'The unique slug of the project'
        parameter :header_bg, 'Base64 encoded header image'
        parameter :area_ids, 'Array of ids of the associated areas'
        parameter :topic_ids, 'Array of ids of the associated topics'
        parameter :visible_to, "Defines who can see the project, either #{Project::VISIBLE_TOS.join(',')}.", required: false
        parameter :participation_method, "Only for continuous projects. Either #{ParticipationContext::PARTICIPATION_METHODS.join(',')}.", required: false
        parameter :posting_enabled, 'Only for continuous projects. Can citizens post ideas in this project?', required: false
        parameter :posting_method, "Only for continuous projects with posting enabled. How does posting work? Either #{ParticipationContext::POSTING_METHODS.join(',')}. Defaults to unlimited for ideation, and limited to one for native surveys.", required: false
        parameter :posting_limited_max, 'Only for continuous projects with limited posting. Number of posts a citizen can perform in this project. Defaults to 1', required: false
        parameter :commenting_enabled, 'Only for continuous projects. Can citizens post comment in this project?', required: false
        parameter :voting_enabled, 'Only for continuous projects. Can citizens vote in this project?', required: false
        parameter :upvoting_method, "Only for continuous projects with voting enabled. How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}.", required: false
        parameter :upvoting_limited_max, 'Only for continuous projects with limited upvoting. Number of upvotes a citizen can perform in this project.', required: false
        parameter :downvoting_enabled, 'Only for continuous projects. Can citizens downvote in this project?', required: false
        parameter :downvoting_method, "Only for continuous projects with downvoting enabled. How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}.", required: false
        parameter :downvoting_limited_max, 'Only for continuous projects with limited downvoting. Number of downvotes a citizen can perform in this project.', required: false
        parameter :survey_embed_url, 'The identifier for the survey from the external API, if participation_method is set to survey', required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyParticipationContext::SURVEY_SERVICES.join(',')}", required: false
        parameter :min_budget, 'The minimum budget amount. Participatory budget should be greater or equal to input.', required: false
        parameter :max_budget, 'The maximal budget amount each citizen can spend during participatory budgeting.', required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{Project::PRESENTATION_MODES.join(',')}.", required: false
        parameter :default_assignee_id, 'The user id of the admin or moderator that gets assigned to ideas by default. Set to null to default to unassigned', required: false
        parameter :poll_anonymous, "Are users associated with their answer? Only applies if participation_method is 'poll'. Can't be changed after first answer.", required: false
        parameter :ideas_order, 'The default order of ideas.'
        parameter :folder_id, 'The ID of the project folder (can be set to nil for top-level projects)'
      end

      with_options scope: %i[project admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the project, either #{AdminPublication::PUBLICATION_STATUSES.join(',')}.", required: false
      end

      ValidationErrorHelper.new.error_fields(self, Project)

      let(:id) { @project.id }
      let(:title_multiloc) { { 'en' => 'Changed title' } }
      let(:description_multiloc) { { 'en' => 'Changed body' } }
      let(:description_preview_multiloc) { @project.description_preview_multiloc }
      let(:slug) { 'changed-title' }
      let(:header_bg) { file_as_base64 'header.jpg', 'image/jpeg' }
      let(:area_ids) { create_list(:area, 2).map(&:id) }
      let(:topic_ids) { create_list(:topic, 2).map(&:id) }
      let(:visible_to) { 'groups' }
      let(:presentation_mode) { 'card' }
      let(:publication_status) { 'archived' }
      let(:ideas_order) { 'new' }
      let(:min_budget) { 100 }
      let(:max_budget) { 1000 }
      let(:default_assignee_id) { create(:admin).id }

      example 'Update a project' do
        old_publcation_ids = AdminPublication.ids
        do_request

        expect(response_status).to eq 200
        # admin publications should not be replaced, but rather should be updated
        expect(AdminPublication.ids).to match_array old_publcation_ids
        expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
        expect(json_response.dig(:data, :attributes, :description_multiloc, :en)).to eq 'Changed body'
        expect(json_response.dig(:data, :attributes, :description_preview_multiloc).stringify_keys).to match description_preview_multiloc
        expect(json_response.dig(:data, :attributes, :slug)).to eq 'changed-title'
        expect(json_response.dig(:data, :relationships, :areas, :data).pluck(:id)).to match_array area_ids
        expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
        expect(json_response.dig(:data, :attributes, :visible_to)).to eq 'groups'
        expect(json_response.dig(:data, :attributes, :ideas_order)).to be_present
        expect(json_response.dig(:data, :attributes, :ideas_order)).to eq 'new'
        expect(json_response.dig(:data, :attributes, :input_term)).to be_present
        expect(json_response.dig(:data, :attributes, :input_term)).to eq 'idea'
        expect(json_response.dig(:data, :attributes, :min_budget)).to eq 100
        expect(json_response.dig(:data, :attributes, :max_budget)).to eq 1000
        expect(json_response.dig(:data, :attributes, :presentation_mode)).to eq 'card'
        expect(json_response[:included].find { |inc| inc[:type] == 'admin_publication' }.dig(:attributes, :publication_status)).to eq 'archived'
        expect(json_response.dig(:data, :relationships, :default_assignee, :data, :id)).to eq default_assignee_id
      end

      example 'Log activities', document: false do
        # It's easier to use a null object instead of a more restrictive spy here
        # because some of the expected jobs are configured before being queued:
        #   LogActivityJob.set(...).perform_later(...)
        stub_const('LogActivityJob', double.as_null_object)

        do_request
        project = Project.find(response_data[:id])

        expect(LogActivityJob).to have_received('perform_later').exactly(2).times

        expect(LogActivityJob)
          .to have_received('perform_later')
          .with(project, 'changed', @user, be_a(Numeric))

        expect(LogActivityJob)
          .to have_received('perform_later')
          .with(project, 'archived', @user, be_a(Numeric), payload: %w[published archived])
      end

      example 'Add a project to a folder' do
        folder = create(:project_folder)

        do_request(project: { folder_id: folder.id })
        @project.reload

        expect(@project.folder_id).to eq folder.id
        # Projects moved into folders are added to the top
        expect(json_response[:included].find { |inc| inc[:type] == 'admin_publication' }.dig(:attributes, :ordering)).to eq 0
      end

      example 'Remove a project from a folder' do
        create(:project_folder, projects: [@project])

        do_request(project: { folder_id: nil })
        @project.reload

        expect(@project.folder_id).to be_nil
        # Projects moved out of folders are added to the top
        expect(json_response[:included].find { |inc| inc[:type] == 'admin_publication' }.dig(:attributes, :ordering)).to eq 0
      end

      example 'Move a project from one folder to another' do
        old_folder = create(:project_folder, projects: [@project])
        new_folder = create(:project_folder)
        old_folder_moderators = create_list(:project_folder_moderator, 2, project_folders: [old_folder])
        new_folder_moderators = create_list(:project_folder_moderator, 3, project_folders: [new_folder])

        do_request(project: { folder_id: new_folder.id })
        @project.reload

        assert_status 200
        expect(@project.folder_id).to eq new_folder.id
        expect(@project.admin_publication.parent.id).to eq new_folder.admin_publication.id

        project_moderators = User.project_moderator(@project.id)
        expect(project_moderators.pluck(:id)).not_to match_array old_folder_moderators.pluck(:id)
        expect(project_moderators.pluck(:id)).to match_array new_folder_moderators.pluck(:id)
      end

      example '[error] Put a project in a non-existing folder' do
        do_request(project: { folder_id: 'dinosaur' })
        expect(response_status).to eq 404
      end

      example 'Clear all areas', document: false do
        @project.update!(area_ids: area_ids)
        expect(@project.areas.size).to eq 2
        do_request(project: { area_ids: [] })
        expect(json_response.dig(:data, :relationships, :areas, :data).size).to eq 0
      end

      example 'Clear all topics', document: false do
        @project.update!(topic_ids: topic_ids)
        expect(@project.topics.size).to eq 2
        do_request(project: { topic_ids: [] })
        expect(json_response.dig(:data, :relationships, :topics, :data).size).to eq 0
      end

      example 'Set default assignee to unassigned', document: false do
        @project.update!(default_assignee: create(:admin))
        do_request(project: { default_assignee_id: nil })
        expect(json_response.dig(:data, :relationships, :default_assignee, :data, :id)).to be_nil
      end

      example 'Disable downvoting', document: false do
        SettingsService.new.activate_feature! 'disable_downvoting'
        do_request(project: { downvoting_enabled: false })
        expect(json_response.dig(:data, :attributes, :downvoting_enabled)).to be false
      end

      example 'Disable downvoting when feature is not enabled', document: false do
        SettingsService.new.deactivate_feature! 'disable_downvoting'
        do_request(project: { downvoting_enabled: false })
        expect(@project.reload.downvoting_enabled).to be true
      end

      describe do
        example 'The header image can be removed' do
          @project.update!(header_bg: Rails.root.join('spec/fixtures/header.jpg').open)
          expect(@project.reload.header_bg_url).to be_present
          do_request project: { header_bg: nil }
          expect(@project.reload.header_bg_url).to be_nil
        end
      end
    end

    delete 'web_api/v1/projects/:id' do
      let(:project) { create(:project) }
      let(:id) { project.id }

      example_request 'Delete a project' do
        expect(response_status).to eq 200
        expect { Project.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      example 'Deleting a project removes associated moderator rights', document: false do
        moderator = create(:project_moderator, projects: [project])
        expect(moderator.project_moderator?(id)).to be true
        do_request
        expect(moderator.reload.project_moderator?(id)).to be false
      end
    end

    get 'web_api/v1/projects/:id/survey_results' do
      let(:project) { create(:continuous_native_survey_project) }
      let(:form) { create(:custom_form, participation_context: project) }
      let(:id) { project.id }
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

      before do
        create(:idea, project: project, custom_field_values: { multiselect_field.key => %w[cat dog] })
        create(:idea, project: project, custom_field_values: { multiselect_field.key => %w[cat] })
      end

      example 'Get survey results' do
        do_request
        expect(status).to eq 200

        expect(json_response).to eq(
          {
            data: {
              results: [
                {
                  inputType: 'multiselect',
                  question: { en: 'What are your favourite pets?' },
                  required: true,
                  totalResponses: 3,
                  answers: [
                    { answer: { en: 'Cat' }, responses: 2 },
                    { answer: { en: 'Dog' }, responses: 1 }
                  ]
                }
              ],
              totalSubmissions: 2
            }
          }
        )
      end
    end

    post 'web_api/v1/projects/:id/copy' do
      let(:source_project) { create(:continuous_project) }
      let(:id) { source_project.id }

      example_request 'Copy a continuous project' do
        assert_status 201

        copied_project = Project.find(json_response.dig(:data, :id))
        expect(copied_project.title_multiloc['en']).to include(source_project.title_multiloc['en'])
      end
    end

    get 'web_api/v1/projects/:id/submission_count' do
      let(:project) { create(:continuous_native_survey_project) }
      let(:form) { create(:custom_form, participation_context: project) }
      let(:id) { project.id }
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
        create(:idea, project: project, custom_field_values: { multiselect_field.key => %w[cat dog] })
        create(:idea, project: project, custom_field_values: { multiselect_field.key => %w[cat] })
        create(:idea, project: project, custom_field_values: { multiselect_field.key => %w[dog] })
      end

      example 'Get submission count' do
        do_request
        expect(status).to eq 200

        expect(json_response).to eq({ data: { totalSubmissions: 3 } })
      end
    end

    get 'web_api/v1/projects/:id/as_xlsx' do
      context 'for a continuous native survey project' do
        let(:project) { create(:continuous_native_survey_project) }
        let(:project_form) { create(:custom_form, participation_context: project) }
        let(:id) { project.id }
        let(:multiselect_field) do
          create(
            :custom_field_multiselect,
            resource: project_form,
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

        context 'when there are no inputs in the project' do
          example 'Download native survey phase inputs in one sheet' do
            do_request
            expect(status).to eq 200
            expect(xlsx_contents(response_body)).to match_array([
              {
                sheet_name: project.title_multiloc['en'],
                column_headers: [
                  'ID',
                  'What are your favourite pets?',
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Project'
                ],
                rows: []
              }
            ])
          end
        end

        context 'when there are inputs in the project' do
          let!(:file_upload_field) do
            create(
              :custom_field,
              resource: project_form,
              title_multiloc: { 'en' => 'Upload your favourite file' },
              input_type: 'file_upload'
            )
          end
          let!(:survey_response1) do
            create(
              :idea,
              project: project,
              custom_field_values: { multiselect_field.key => %w[cat dog] }
            )
          end
          let!(:survey_response2) do
            create(
              :idea,
              project: project,
              custom_field_values: { multiselect_field.key => %w[cat] }
            )
          end

          example 'Download native survey phase inputs in one sheet' do
            do_request
            expect(status).to eq 200
            expect(xlsx_contents(response_body)).to match_array([
              {
                sheet_name: project.title_multiloc['en'],
                column_headers: [
                  'ID',
                  multiselect_field.title_multiloc['en'],
                  'Upload your favourite file',
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Project'
                ],
                rows: [
                  [
                    survey_response1.id,
                    'Cat, Dog',
                    '',
                    survey_response1.author_name,
                    survey_response1.author.email,
                    survey_response1.author_id,
                    an_instance_of(DateTime), # created_at
                    project.title_multiloc['en']
                  ],
                  [
                    survey_response2.id,
                    'Cat',
                    '',
                    survey_response2.author_name,
                    survey_response2.author.email,
                    survey_response2.author_id,
                    an_instance_of(DateTime), # created_at
                    project.title_multiloc['en']
                  ]
                ]
              }
            ])
          end
        end
      end

      context 'for a timeline project' do
        let(:project) { create(:project, process_type: 'timeline') }
        let(:project_form) { create(:custom_form, participation_context: project) }
        let(:active_phase) do
          create(
            :active_phase,
            project: project,
            participation_method: 'native_survey',
            title_multiloc: {
              'en' => 'Phase 2: survey',
              'nl-BE' => 'Fase 2: survey'
            }
          )
        end
        let(:future_phase) do
          create(
            :phase,
            project: project,
            participation_method: 'native_survey',
            start_at: active_phase.end_at + 30.days,
            end_at: active_phase.end_at + 60.days,
            title_multiloc: {
              'en' => 'Phase 3: survey',
              'nl-BE' => 'Fase 3: survey'
            }
          )
        end
        let(:ideation_phase) do
          create(
            :phase,
            project: project,
            participation_method: 'ideation',
            start_at: active_phase.start_at - 60.days,
            end_at: active_phase.start_at - 30.days,
            title_multiloc: {
              'en' => 'Phase 1: ideation',
              'nl-BE' => 'Fase 1: ideeën'
            }
          )
        end
        let(:active_phase_form) { create(:custom_form, participation_context: active_phase) }
        let(:future_phase_form) { create(:custom_form, participation_context: future_phase) }
        let(:id) { project.id }
        # Create a page to describe that it is not included in the export.
        let!(:page_field) { create(:custom_field_page, resource: active_phase_form) }
        let(:multiselect_field) do
          create(
            :custom_field_multiselect,
            resource: active_phase_form,
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
        let!(:linear_scale_field) do
          create(
            :custom_field_linear_scale,
            resource: future_phase_form
          )
        end
        let!(:extra_idea_field) do
          create(
            :custom_field_extra_custom_form,
            resource: project_form
          )
        end

        context 'when there are no inputs in the phases' do
          example 'Download native survey phase inputs in separate sheets' do
            do_request
            expect(status).to eq 200
            expect(xlsx_contents(response_body)).to match_array([
              {
                sheet_name: 'Phase 2 survey', # The colon is removed from phase title "Phase 2: survey"
                column_headers: [
                  'ID',
                  'What are your favourite pets?',
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Project'
                ],
                rows: []
              },
              {
                sheet_name: 'Phase 3 survey', # The colon is removed from phase title "Phase 3: survey"
                column_headers: [
                  'ID',
                  'We need a swimming pool.',
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Project'
                ],
                rows: []
              }
            ])
          end
        end

        context 'when there are inputs in the phases' do
          let!(:ideation_response1) do
            create(
              :idea,
              project: project,
              custom_field_values: { extra_idea_field.key => 'Answer' }
            )
          end
          let!(:active_survey_response1) do
            create(
              :idea,
              project: project,
              creation_phase: active_phase,
              phases: [active_phase],
              custom_field_values: { multiselect_field.key => %w[cat dog] }
            )
          end
          let!(:active_survey_response2) do
            create(
              :idea,
              project: project,
              creation_phase: active_phase,
              phases: [active_phase],
              custom_field_values: { multiselect_field.key => %w[cat] }
            )
          end
          let!(:future_survey_response1) do
            create(
              :idea,
              project: project,
              creation_phase: active_phase,
              phases: [future_phase],
              custom_field_values: { linear_scale_field.key => 4 }
            )
          end

          example 'Download native survey phase inputs in separate sheets' do
            do_request
            expect(status).to eq 200
            expect(xlsx_contents(response_body)).to match_array([
              {
                sheet_name: 'Phase 2 survey', # The colon is removed from phase title "Phase 2: survey"
                column_headers: [
                  'ID',
                  multiselect_field.title_multiloc['en'],
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Project'
                ],
                rows: [
                  [
                    active_survey_response1.id,
                    'Cat, Dog',
                    active_survey_response1.author_name,
                    active_survey_response1.author.email,
                    active_survey_response1.author_id,
                    an_instance_of(DateTime), # created_at
                    project.title_multiloc['en']
                  ],
                  [
                    active_survey_response2.id,
                    'Cat',
                    active_survey_response2.author_name,
                    active_survey_response2.author.email,
                    active_survey_response2.author_id,
                    an_instance_of(DateTime), # created_at
                    project.title_multiloc['en']
                  ]
                ]
              },
              {
                sheet_name: 'Phase 3 survey', # The colon is removed from phase title "Phase 3: survey"
                column_headers: [
                  'ID',
                  linear_scale_field.title_multiloc['en'],
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Project'
                ],
                rows: [
                  [
                    future_survey_response1.id,
                    4,
                    future_survey_response1.author_name,
                    future_survey_response1.author.email,
                    future_survey_response1.author_id,
                    an_instance_of(DateTime), # created_at
                    project.title_multiloc['en']
                  ]
                ]
              }
            ])
          end
        end
      end
    end

    delete 'web_api/v1/projects/:id/inputs' do
      let(:project) { create(:continuous_project) }
      let(:id) { project.id }

      example 'Delete all inputs of a project' do
        create_list(:idea, 2, project: project)
        create(:idea)
        expect_any_instance_of(SideFxProjectService).to receive(:after_delete_inputs)

        do_request
        assert_status 200
        expect(Project.find(id)).to eq project
        expect(project.reload.ideas_count).to eq 0
        expect(Idea.count).to eq 1
      end
    end
  end

  get 'web_api/v1/projects' do
    context 'when moderator' do
      before do
        @project = create(:project)
        @moderator = create(:project_moderator, projects: [@project])
        header_token_for(@moderator)

        @projects = create_list(:project, 10, admin_publication_attributes: { publication_status: 'published' })
      end

      example 'List all projects the current user can moderate' do
        n_moderating_projects = 3
        @projects.shuffle.take(n_moderating_projects).each do |pj|
          @moderator.add_role 'project_moderator', project_id: pj.id
        end
        @moderator.save!

        do_request filter_can_moderate: true
        assert_status 200
        expect(json_response[:data].size).to eq n_moderating_projects + 1
      end
    end

    context 'when admin' do
      before do
        @user = create(:admin)
        header_token_for @user

        @projects = %w[published published draft published archived published archived]
          .map { |ps| create(:project, admin_publication_attributes: { publication_status: ps }) }
      end

      example 'Admins moderate all projects', document: false do
        do_request filter_can_moderate: true, publication_statuses: AdminPublication::PUBLICATION_STATUSES
        assert_status 200
        expect(json_response[:data].size).to eq @projects.size
      end
    end

    context 'when non-moderator/non-admin user' do
      before do
        @user = create(:user, roles: [])
        header_token_for @user
      end

      example 'Get projects with access rights' do
        create(:project)
        do_request
        assert_status 200
        expect(json_response[:data].size).to eq 1
      end

      example 'Residents cannot moderate any projects', document: false do
        %w[published published draft published archived published archived]
          .map { |ps| create(:project, admin_publication_attributes: { publication_status: ps }) }
        do_request(filter_can_moderate: true, publication_statuses: AdminPublication::PUBLICATION_STATUSES)
        assert_status 200
        expect(json_response[:data].size).to eq 0
      end

      post 'web_api/v1/projects/:id/copy' do
        let(:source_project) { create(:continuous_project) }
        let(:id) { source_project.id }

        example_request 'Copy a continuous project' do
          assert_status 401
        end
      end
    end
  end

  get 'web_api/v1/projects/:id/as_xlsx' do
    context 'for a continuous project' do
      let(:project) { create(:continuous_project) }
      let(:id) { project.id }

      example '[error] Try downloading phase inputs' do
        do_request
        expect(status).to eq 401
      end
    end

    context 'for a timeline project' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:id) { project.id }

      example '[error] Try downloading phase inputs' do
        do_request
        expect(status).to eq 401
      end
    end
  end

  context 'when not logged in' do
    get 'web_api/v1/projects' do
      parameter :filter_can_moderate, 'Filter out the projects the user is allowed to moderate. False by default', required: false

      before do
        @projects = create_list(:project, 10, admin_publication_attributes: { publication_status: 'published' })
      end

      let(:filter_can_moderate) { true }

      example 'List all projects the current user can moderate', document: false do
        do_request
        assert_status 200
        expect(json_response[:data].size).to eq 0
      end
    end

    delete 'web_api/v1/projects/:id/inputs' do
      let(:project) { create(:continuous_project) }
      let(:id) { project.id }

      example '[error] Delete all inputs of a project' do
        create(:idea, project: project)

        do_request
        assert_status 401
      end
    end
  end

  context 'as a project folder moderator' do
    before { header_token_for user }

    let!(:project_folder) { create(:project_folder) }
    let!(:user) { create(:project_folder_moderator, project_folders: [project_folder]) }
    let!(:projects_within_folder) do
      projects = publication_statuses.map do |status|
        create(
          :project,
          admin_publication_attributes: {
            publication_status: status,
            parent_id: project_folder.admin_publication.id
          }
        )
      end
      Project.includes(:admin_publication).where(projects: { id: projects.pluck(:id) })
    end

    let!(:projects_outside_of_folder) do
      projects = publication_statuses.map do |status|
        create(
          :project,
          admin_publication_attributes: {
            publication_status: status
          }
        )
      end
      Project.includes(:admin_publication).where(projects: { id: projects.pluck(:id) })
    end

    let(:publication_statuses) { AdminPublication::PUBLICATION_STATUSES }

    get 'web_api/v1/projects' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of projects per page'
      end

      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :publication_statuses, 'Return only projects with the specified publication statuses (i.e. given an array of publication statuses); returns all projects by default', required: false
      parameter :filter_can_moderate, 'Filter out the projects the user is allowed to moderate. False by default', required: false
      parameter :folder, 'Filter by folder (project folder id)', required: false
      parameter :filter_ids, 'Filter out only projects with the given list of IDs', required: false

      example_request 'Lists projects that belong to a folder the user moderates' do
        expect(status).to eq(200)

        json_response = json_parse(response_body)
        ids = json_response[:data].pluck(:id)
        projects = Project.includes(:admin_publication)
          .where(admin_publications: { publication_status: %w[published archived] })
          .where(projects: { visible_to: 'public' })
          .or(projects_within_folder)

        expect(ids).to match_array projects.pluck(:id)
      end
    end

    post 'web_api/v1/projects' do
      with_options scope: :project do
        parameter :process_type, "The type of process used in this project. Can't be changed after. One of #{Project::PROCESS_TYPES.join(',')}. Defaults to timeline"
        parameter :title_multiloc, 'The title of the project, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the project, as a multiloc HTML string', required: true
        parameter :description_preview_multiloc, 'The description preview of the project, as a multiloc string'
        parameter :slug, 'The unique slug of the project. If not given, it will be auto generated'
        parameter :header_bg, 'Base64 encoded header image'
        parameter :area_ids, 'Array of ids of the associated areas'
        parameter :topic_ids, 'Array of ids of the associated topics'
        parameter :visible_to, "Defines who can see the project, either #{Project::VISIBLE_TOS.join(',')}. Defaults to public.", required: false
        parameter :participation_method, "Only for continuous projects. Either #{ParticipationContext::PARTICIPATION_METHODS.join(',')}. Defaults to ideation.", required: false
        parameter :posting_enabled, 'Only for continuous projects. Can citizens post ideas in this project? Defaults to true', required: false
        parameter :posting_method, "Only for continuous projects with posting enabled. How does posting work? Either #{ParticipationContext::POSTING_METHODS.join(',')}. Defaults to unlimited for ideation, and limited to one for native surveys.", required: false
        parameter :posting_limited_max, 'Only for continuous projects with limited posting. Number of posts a citizen can perform in this project. Defaults to 1', required: false
        parameter :commenting_enabled, 'Only for continuous projects. Can citizens post comment in this project? Defaults to true', required: false
        parameter :voting_enabled, 'Only for continuous projects. Can citizens vote in this project? Defaults to true', required: false
        parameter :upvoting_method, "Only for continuous projects with voting enabled. How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}. Defaults to unlimited", required: false
        parameter :upvoting_limited_max, 'Only for continuous projects with limited voting. Number of upvotes a citizen can perform in this project. Defaults to 10', required: false
        parameter :downvoting_enabled, 'Only for continuous projects. Can citizens downvote in this project? Defaults to true', required: false
        parameter :downvoting_method, "Only for continuous projects with downvoting enabled. How does voting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}. Defaults to unlimited", required: false
        parameter :downvoting_limited_max, 'Only for continuous projects with limited voting. Number of downvotes a citizen can perform in this project. Defaults to 10', required: false
        parameter :survey_embed_url, 'The identifier for the survey from the external API, if participation_method is set to survey', required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyParticipationContext::SURVEY_SERVICES.join(',')}", required: false
        parameter :max_budget, 'The maximal budget amount each citizen can spend during participatory budgeting.', required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{ParticipationContext::PRESENTATION_MODES.join(',')}. Defaults to card.", required: false
        parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", required: false
        parameter :folder_id, 'The ID of the project folder (can be set to nil for top-level projects)', required: false
        parameter :ideas_order, 'The default order of ideas.'
      end

      with_options scope: %i[project admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the project, either #{AdminPublication::PUBLICATION_STATUSES.join(',')}. Defaults to published.", required: false
      end

      ValidationErrorHelper.new.error_fields(self, Project)

      describe do
        let(:project) { build(:project) }
        let(:title_multiloc) { project.title_multiloc }
        let(:description_multiloc) { project.description_multiloc }
        let(:description_preview_multiloc) { project.description_preview_multiloc }
        let(:header_bg) { png_image_as_base64('header.jpg') }
        let(:area_ids) { create_list(:area, 2).map(&:id) }
        let(:visible_to) { 'admins' }
        let(:publication_status) { 'draft' }
        let!(:other_folder_moderators) { create_list(:project_folder_moderator, 3, project_folders: [project_folder]) }
        let(:last_project) { Project.order(created_at: :desc).take }

        context 'when passing a folder_id of a folder the user moderates' do
          let(:folder_id) { project_folder.id }

          example_request 'Allows the creation of a project within a folder the user moderates' do
            expect(response_status).to eq 201

            json_response                    = json_parse(response_body)
            response_resource_id             = json_response.dig(:data, :id)
            admin_publication_ordering       = last_project.admin_publication.ordering
            admin_publication_parent         = last_project.admin_publication.parent

            expect(response_resource_id).to eq last_project.id
            expect(admin_publication_ordering).to eq 0
            expect(admin_publication_parent).to eq project_folder.admin_publication
          end

          example_request 'Adds all folder moderators as moderators of the project' do
            expect(response_status).to eq 201

            json_response              = json_parse(response_body)
            response_resource_id       = json_response.dig(:data, :id)
            project_moderators         = User.project_moderator(response_resource_id)
            folder_moderators          = User.project_folder_moderator(project_folder.id)

            expect(project_moderators.pluck(:id)).to match_array folder_moderators.pluck(:id)
          end
        end

        context 'when passing a folder_id of a folder the user does not moderate' do
          let(:folder_id) { create(:project_folder).id }

          example_request 'It does not authorize the folder moderator' do
            expect(response_status).to eq 401
          end
        end
      end
    end

    patch 'web_api/v1/projects/:id' do
      describe do
        let!(:project) { create(:project) }

        let(:id) { project.id }

        example_request 'It does not authorize the folder moderator' do
          expect(response_status).to eq 401
        end
      end
    end

    delete 'web_api/v1/projects/:id' do
      describe do
        let!(:project) { create(:project) }

        let(:id) { project.id }

        example_request 'It does not authorize the folder moderator' do
          expect(response_status).to eq 401
        end
      end
    end

    post 'web_api/v1/projects/:id/copy' do
      let!(:project_in_folder_user_moderates) { create(:continuous_project, folder: project_folder) }
      let!(:project_in_other_folder) { create(:continuous_project, folder: create(:project_folder)) }
      let!(:other_folder_moderators) { create_list(:project_folder_moderator, 3, project_folders: [project_folder]) }

      context 'when passing the id of project in a folder the user moderates' do
        let(:id) { project_in_folder_user_moderates.id }

        example_request 'Allows the copying of a project within a folder the user moderates' do
          expect(response_status).to eq 201

          copied_project = Project.find(json_response.dig(:data, :id))
          expect(copied_project.title_multiloc['en']).to include(project_in_folder_user_moderates.title_multiloc['en'])
        end

        example_request 'Adds all folder moderators as moderators of the project' do
          expect(response_status).to eq 201

          response_resource_id = json_response.dig(:data, :id)
          project_moderators = User.project_moderator(response_resource_id)
          folder_moderators = User.project_folder_moderator(project_folder.id)

          expect(project_moderators.pluck(:id)).to match_array folder_moderators.pluck(:id)
        end
      end

      context 'when passing the id of project in a folder the user does not moderate' do
        let(:id) { project_in_other_folder.id }

        example_request 'It does not authorize the folder moderator' do
          expect(response_status).to eq 401
        end
      end
    end
  end
end
