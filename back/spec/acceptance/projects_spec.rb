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
      parameter :filter_can_moderate, 'Filter out the projects the current_user is not allowed to moderate. False by default', required: false
      parameter :filter_user_is_moderator_of, 'Filter out the projects the given user is moderator of (user id)', required: false
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

      example 'List projects a specific user can moderate', document: false do
        moderator = create(
          :user,
          roles: [
            { type: 'project_moderator', project_id: @projects[0].id },
            { type: 'project_moderator', project_id: @projects[1].id }
          ]
        )

        do_request filter_user_is_moderator_of: moderator.id
        assert_status 200
        expect(json_response[:data].pluck(:id)).to match_array [@projects[0].id, @projects[1].id]
      end
    end

    get 'web_api/v1/projects/:id' do
      let(:id) { @projects.first.id }

      before do
        Analytics::PopulateDimensionsService.populate_types
      end

      example 'Get one project by id' do
        Permissions::PermissionsUpdateService.new.update_all_permissions
        do_request
        assert_status 200

        expect(json_response.dig(:data, :id)).to eq @projects.first.id
        expect(json_response.dig(:data, :type)).to eq 'project'
        expect(json_response.dig(:data, :attributes)).to include(
          slug: @projects.first.slug,
          timeline_active: nil,
          action_descriptors: {
            posting_idea: { enabled: false, disabled_reason: 'project_inactive', future_enabled_at: nil },
            commenting_idea: { enabled: false, disabled_reason: 'project_inactive' },
            reacting_idea: {
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
            comment_reacting_idea: { enabled: false, disabled_reason: 'project_inactive' },
            annotating_document: { enabled: false, disabled_reason: 'project_inactive' },
            taking_survey: { enabled: false, disabled_reason: 'project_inactive' },
            taking_poll: { enabled: false, disabled_reason: 'project_inactive' },
            voting: { enabled: false, disabled_reason: 'project_inactive' },
            attending_event: { enabled: true, disabled_reason: nil },
            volunteering: { enabled: false, disabled_reason: 'project_inactive' }
          }
        )
        expect(json_response.dig(:data, :relationships)).to include(
          areas: { data: [] }
        )
        expect(json_response[:included].pluck(:type)).to include 'admin_publication'
      end

      example 'Get a project with followers', document: false do
        project = create(:project)
        followers = [@user, create(:user)].map do |user|
          create(:follower, followable: project, user: user)
        end
        do_request id: project.id
        assert_status 200
        expect(json_response.dig(:data, :attributes, :followers_count)).to eq 2
        expect(json_response.dig(:data, :relationships, :user_follower, :data, :id)).to eq followers.first.id
      end

      example 'Get a project on a timeline project includes the current_phase', document: false do
        project = create(:project_with_current_phase)
        current_phase = project.phases[2]
        do_request id: project.id
        assert_status 200
        expect(json_response.dig(:data, :relationships, :current_phase, :data, :id)).to eq current_phase.id
        expect(json_response[:included].pluck(:id)).to include(current_phase.id)
      end

      example 'Get a project includes the participants_count and avatars_count', document: false do
        idea = create(:idea)
        project = idea.project
        do_request id: project.id
        assert_status 200
        expect(json_response.dig(:data, :attributes, :participants_count)).to eq 1
        expect(json_response.dig(:data, :attributes, :avatars_count)).to eq 1
      end
    end

    get 'web_api/v1/projects/by_slug/:slug' do
      let(:slug) { @projects.first.slug }

      example_request 'Get one project by slug' do
        assert_status 200
        expect(json_response.dig(:data, :id)).to eq @projects.first.id
      end

      describe do
        let(:slug) { 'unexisting-project' }

        example 'Get an unexisting project by slug', document: false do
          do_request
          assert_status 404
        end
      end
    end

    post 'web_api/v1/projects' do
      with_options scope: :project do
        parameter :title_multiloc, 'The title of the project, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the project, as a multiloc HTML string', required: true
        parameter :description_preview_multiloc, 'The description preview of the project, as a multiloc string'
        parameter :slug, 'The unique slug of the project. If not given, it will be auto generated'
        parameter :header_bg, 'Base64 encoded header image'
        parameter :area_ids, 'Array of ids of the associated areas'
        parameter :topic_ids, 'Array of ids of the associated topics'
        parameter :visible_to, "Defines who can see the project, either #{Project::VISIBLE_TOS.join(',')}. Defaults to public.", required: false
        parameter :folder_id, 'The ID of the project folder (can be set to nil for top-level projects)', required: false
        parameter :default_assignee_id, 'The user id of the admin or moderator that gets assigned to ideas by default. Defaults to unassigned', required: false
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
    end

    patch 'web_api/v1/projects/:id' do
      before do
        @project = create(:project)
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
        parameter :default_assignee_id, 'The user id of the admin or moderator that gets assigned to ideas by default. Set to null to default to unassigned', required: false
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
      let(:publication_status) { 'archived' }
      let(:default_assignee_id) { create(:admin).id }

      example 'Update a project' do
        old_publcation_ids = AdminPublication.ids
        do_request

        assert_status 200
        # admin publications should not be replaced, but rather should be updated
        expect(AdminPublication.ids).to match_array old_publcation_ids
        expect(json_response.dig(:data, :attributes, :title_multiloc, :en)).to eq 'Changed title'
        expect(json_response.dig(:data, :attributes, :description_multiloc, :en)).to eq 'Changed body'
        expect(json_response.dig(:data, :attributes, :description_preview_multiloc).stringify_keys).to match description_preview_multiloc
        expect(json_response.dig(:data, :attributes, :slug)).to eq 'changed-title'
        expect(json_response.dig(:data, :relationships, :areas, :data).pluck(:id)).to match_array area_ids
        expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
        expect(json_response.dig(:data, :attributes, :visible_to)).to eq 'groups'
        expect(json_response[:included].find { |inc| inc[:type] == 'admin_publication' }.dig(:attributes, :publication_status)).to eq 'archived'
        expect(json_response.dig(:data, :relationships, :default_assignee, :data, :id)).to eq default_assignee_id
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

      describe do
        example 'The header image can be removed' do
          @project.update!(header_bg: Rails.root.join('spec/fixtures/header.jpg').open)
          expect(@project.reload.header_bg_url).to be_present
          do_request project: { header_bg: nil }
          expect(@project.reload.header_bg_url).to be_nil
        end
      end

      example 'Logs `published` activity when going from draft to published', document: false do
        @project.admin_publication.update!(publication_status: 'draft')
        expect { do_request project: { admin_publication_attributes: { publication_status: 'published' } } }
          .to have_enqueued_job(LogActivityJob)
          .with(@project, 'published', anything, anything, anything)
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

    post 'web_api/v1/projects/:id/copy' do
      let(:source_project) { create(:single_phase_ideation_project) }
      let(:id) { source_project.id }

      example_request 'Copy a project' do
        assert_status 201

        copied_project = Project.find(json_response.dig(:data, :id))
        expect(copied_project.title_multiloc['en']).to include(source_project.title_multiloc['en'])
      end
    end

    get 'web_api/v1/projects/:id/as_xlsx' do
      let(:project) { create(:project) }
      let(:project_form) { create(:custom_form, :with_default_fields, participation_context: project) }
      let!(:extra_idea_field) { create(:custom_field, resource: project_form) }
      let(:ideation_phase) do
        create(
          :phase,
          project: project,
          participation_method: 'ideation',
          title_multiloc: { 'en' => 'Phase 1: Ideation' },
          start_at: (Time.zone.today - 40.days),
          end_at: (Time.zone.today - 31.days)
        )
      end
      let(:native_survey_phase) do
        create(
          :native_survey_phase,
          project: project,
          title_multiloc: { 'en' => 'Phase 2: Native survey' },
          start_at: (Time.zone.today - 30.days),
          end_at: (Time.zone.today - 21.days)
        )
      end
      let(:survey_form) { create(:custom_form, participation_context: native_survey_phase) }
      let!(:linear_scale_field) { create(:custom_field_linear_scale, resource: survey_form) }
      let(:information_phase) do
        create(
          :phase,
          project: project,
          participation_method: 'information',
          title_multiloc: { 'en' => 'Phase 3: Information' },
          start_at: (Time.zone.today - 20.days),
          end_at: (Time.zone.today - 11.days)
        )
      end
      let(:single_voting_phase) do
        create(
          :single_voting_phase,
          project: project,
          title_multiloc: { 'en' => 'Phase 4: Voting' },
          start_at: (Time.zone.today - 10.days),
          end_at: (Time.zone.today + 2.days)
        )
      end
      let(:id) { project.id }

      let!(:ideation_response) do
        create(
          :idea,
          project: project,
          custom_field_values: { extra_idea_field.key => 'Answer' },
          phases: [ideation_phase, single_voting_phase]
        )
      end
      let!(:survey_response) do
        create(
          :idea,
          project: project,
          creation_phase: native_survey_phase,
          phases: [native_survey_phase],
          custom_field_values: { linear_scale_field.key => 2 }
        )
      end

      example_request 'Download inputs of a timeline project with different phases in separate sheets' do
        assert_status 200
        xlsx = xlsx_contents response_body
        expect(xlsx.size).to eq 3
        expect(xlsx).to match_array([
          {
            sheet_name: 'Phase 1 Ideation',
            column_headers: [
              'ID',
              'Title',
              'Description',
              'Attachments',
              'Tags',
              'Latitude',
              'Longitude',
              'Location',
              'Proposed Budget',
              extra_idea_field.title_multiloc['en'],
              'Author name',
              'Author email',
              'Author ID',
              'Submitted at',
              'Published at',
              'Comments',
              'Likes',
              'Dislikes',
              'URL',
              'Project',
              'Status',
              'Assignee',
              'Assignee email'
            ],
            rows: [
              [
                ideation_response.id,
                ideation_response.title_multiloc['en'],
                'It would improve the air quality!', # html tags are removed
                '',
                '',
                ideation_response.location_point.coordinates.last,
                ideation_response.location_point.coordinates.first,
                ideation_response.location_description,
                ideation_response.proposed_budget,
                'Answer',
                ideation_response.author_name,
                ideation_response.author.email,
                ideation_response.author_id,
                an_instance_of(DateTime), # created_at
                an_instance_of(DateTime), # published_at
                0,
                0,
                0,
                "http://example.org/ideas/#{ideation_response.slug}",
                project.title_multiloc['en'],
                ideation_response.idea_status.title_multiloc['en'],
                nil,
                nil
              ]
            ]
          },
          {
            sheet_name: 'Phase 2 Native survey',
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
                survey_response.id,
                2,
                survey_response.author_name,
                survey_response.author.email,
                survey_response.author_id,
                an_instance_of(DateTime), # created_at
                project.title_multiloc['en']
              ]
            ]
          },
          # Phase 3 is not included because it's an information phase.
          {
            sheet_name: 'Phase 4 Voting',
            column_headers: [
              'ID',
              'Title',
              'Description',
              'Attachments',
              'Tags',
              'Latitude',
              'Longitude',
              'Location',
              'Proposed Budget',
              extra_idea_field.title_multiloc['en'],
              'Author name',
              'Author email',
              'Author ID',
              'Submitted at',
              'Published at',
              'Comments',
              'Votes',
              'URL',
              'Project',
              'Status',
              'Assignee',
              'Assignee email'
            ],
            rows: [
              [
                ideation_response.id,
                ideation_response.title_multiloc['en'],
                'It would improve the air quality!', # html tags are removed
                '',
                '',
                ideation_response.location_point.coordinates.last,
                ideation_response.location_point.coordinates.first,
                ideation_response.location_description,
                ideation_response.proposed_budget,
                'Answer',
                ideation_response.author_name,
                ideation_response.author.email,
                ideation_response.author_id,
                an_instance_of(DateTime), # created_at
                an_instance_of(DateTime), # published_at
                0,
                0,
                "http://example.org/ideas/#{ideation_response.slug}",
                project.title_multiloc['en'],
                ideation_response.idea_status.title_multiloc['en'],
                nil,
                nil
              ]
            ]
          }
        ])
      end
    end
  end

  get 'web_api/v1/projects/:id/votes_by_user_xlsx' do
    let(:phase1) { create(:single_voting_phase, start_at: Time.now - 18.days, end_at: Time.now - 17.days) }
    let(:phase2) { create(:multiple_voting_phase, start_at: Time.now - 14.days, end_at: Time.now - 13.days) }
    let(:phase3) { create(:budgeting_phase, start_at: Time.now - 11.days, end_at: Time.now - 10.days) }
    let(:project) { create(:project, phases: [phase1, phase2, phase3]) }
    let(:id) { project.id }

    context 'as a regular user' do
      before { header_token_for(create(:user)) }

      example_request '[Unauthorized] Get xlsx of voters in voting phases', document: false do
        expect(status).to eq 401
      end
    end

    context 'as an admin' do
      before do
        @admin = create(:admin)
        header_token_for(@admin)
      end

      example_request 'Get xlsx of voters in voting phases' do
        expect(status).to eq 200
        expect(response_headers['Content-Type']).to include('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        expect(response_headers['Content-Disposition']).to include('votes_by_user.xlsx')
      end

      example 'Get xlsx of voters successfully translates column headers', document: false do
        fixtures = YAML.load_file(Rails.root.join('spec/fixtures/locales/nl-NL.yml'))
        dutch_column_headers = fixtures['nl']['xlsx_export']['column_headers']
        @admin.update!(locale: 'nl-NL')

        do_request
        expect(status).to eq 200

        workbook = RubyXL::Parser.parse_buffer(response_body)
        header_row1 = workbook.worksheets[0][0].cells.map(&:value)
        header_row2 = workbook.worksheets[1][0].cells.map(&:value)
        header_row3 = workbook.worksheets[2][0].cells.map(&:value)

        expect(header_row1).to match_array([dutch_column_headers['submitted_at']])
        expect(header_row2).to match_array([dutch_column_headers['submitted_at']])
        expect(header_row3).to match_array([dutch_column_headers['submitted_at']])
      end
    end

    context 'as a project moderator' do
      before do
        header 'Content-Type', 'application/json'
        @user = create(:user, roles: [{ type: 'project_moderator', project_id: project.id }])
        header_token_for @user
      end

      example_request 'Get xlsx of voters in voting phases of project the user moderates' do
        expect(status).to eq 200
        expect(response_headers['Content-Type']).to include('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        expect(response_headers['Content-Disposition']).to include('votes_by_user.xlsx')
      end

      example '[Unauthorized] Get xlsx of voters in voting phases of project the user does NOT moderate', document: false do
        do_request(id: create(:project).id)
        expect(status).to eq 401
      end
    end
  end

  get 'web_api/v1/projects/:id/votes_by_input_xlsx' do
    let(:phase1) { create(:single_voting_phase, start_at: Time.now - 18.days, end_at: Time.now - 17.days) }
    let(:phase2) { create(:multiple_voting_phase, start_at: Time.now - 14.days, end_at: Time.now - 13.days) }
    let(:phase3) { create(:budgeting_phase, start_at: Time.now - 11.days, end_at: Time.now - 10.days) }
    let(:project) { create(:project, phases: [phase1, phase2, phase3]) }
    let(:id) { project.id }

    context 'as a regular user' do
      before { header_token_for(create(:user)) }

      example_request '[Unauthorized] Get xlsx of voting results in voting phases', document: false do
        expect(status).to eq 401
      end
    end

    context 'as an admin' do
      before do
        @admin = create(:admin)
        header_token_for(@admin)
      end

      example_request 'Get xlsx of voting results in voting phases' do
        expect(status).to eq 200
        expect(response_headers['Content-Type']).to include('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        expect(response_headers['Content-Disposition']).to include('votes_by_input.xlsx')
      end

      example 'Get xlsx of voters successfully translates column headers', document: false do
        fixtures = YAML.load_file(Rails.root.join('spec/fixtures/locales/fr-FR.yml'))
        french_column_headers = fixtures['fr']['xlsx_export']['column_headers']
        @admin.update!(locale: 'fr-FR')

        do_request
        expect(status).to eq 200

        workbook = RubyXL::Parser.parse_buffer(response_body)
        header_row1 = workbook.worksheets[0][0].cells.map(&:value)
        header_row2 = workbook.worksheets[1][0].cells.map(&:value)
        header_row3 = workbook.worksheets[2][0].cells.map(&:value)

        expected_first_columns = [
          french_column_headers['input_id'],
          french_column_headers['title'],
          french_column_headers['description']
        ]

        expected_last_columns = [
          french_column_headers['input_url'],
          french_column_headers['attachments'],
          french_column_headers['tags'],
          french_column_headers['latitude'],
          french_column_headers['longitude'],
          french_column_headers['location'],
          french_column_headers['project'],
          french_column_headers['status'],
          french_column_headers['author_fullname'],
          french_column_headers['author_email'],
          french_column_headers['author_id'],
          french_column_headers['published_at']
        ]

        expect(header_row1).to match_array(
          expected_first_columns + [french_column_headers['votes_count']] + expected_last_columns
        )
        expect(header_row2).to match_array(
          expected_first_columns +
          [french_column_headers['votes_count'], french_column_headers['participants']] +
          expected_last_columns
        )
        expect(header_row3).to match_array(
          expected_first_columns +
          [
            "#{french_column_headers['picks']} / #{french_column_headers['participants']}",
            french_column_headers['cost']
          ] +
          expected_last_columns
        )
      end
    end

    context 'as a project moderator' do
      before do
        header 'Content-Type', 'application/json'
        @user = create(:user, roles: [{ type: 'project_moderator', project_id: project.id }])
        header_token_for @user
      end

      example_request 'Get xlsx of voting results in voting phases of project the user moderates' do
        expect(status).to eq 200
        expect(response_headers['Content-Type']).to include('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        expect(response_headers['Content-Disposition']).to include('votes_by_input.xlsx')
      end

      example '[Unauthorized] Get xlsx of voters in voting phases of project the user does NOT moderate', document: false do
        do_request(id: create(:project).id)
        expect(status).to eq 401
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
        let(:source_project) { create(:single_phase_ideation_project) }
        let(:id) { source_project.id }

        example_request 'Copy a project' do
          assert_status 401
        end
      end
    end
  end

  get 'web_api/v1/projects/:id/as_xlsx' do
    describe do
      let(:id) { create(:single_phase_ideation_project).id }

      example '[error] Try downloading project inputs' do
        do_request
        assert_status 401
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
  end

  context 'as a project folder moderator' do
    before { header_token_for moderator }

    let!(:project_folder) { create(:project_folder, projects: projects) }
    let(:moderator) { create(:project_folder_moderator, project_folders: [project_folder]) }
    let(:projects) do
      publication_statuses.map do |status|
        create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: status })
      end
    end
    let!(:projects_outside_of_folder) do
      publication_statuses.map do |status|
        create(:project, admin_publication_attributes: { publication_status: status })
      end
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
        assert_status 200
        json_response = json_parse(response_body)
        ids = json_response[:data].pluck(:id)
        expected_projects = Project.includes(:admin_publication)
          .where(admin_publications: { publication_status: %w[published archived] })
          .where(projects: { visible_to: 'public' })
          .or(Project.where(id: projects.map(&:id)))

        expect(ids).to match_array expected_projects.pluck(:id)
      end
    end

    get 'web_api/v1/projects/:id/as_xlsx' do
      describe do
        let(:project) { projects.first }
        let(:id) { project.id }
        let!(:idea) { create(:idea, project: project, phases: project.phases) }

        example 'Download phase inputs WITH private user data', document: false do
          phase = project.phases.first
          expected_params = [[idea], project.phases.first, { view_private_attributes: true }]
          allow(Export::Xlsx::InputSheetGenerator).to receive(:new)
            .and_return(Export::Xlsx::InputSheetGenerator.new(*expected_params))
          do_request
          expect(Export::Xlsx::InputSheetGenerator).to have_received(:new).with(*expected_params)
          assert_status 200

          expect(xlsx_contents(response_body)).to match([
            {
              sheet_name: phase.title_multiloc['en'],
              column_headers: [
                'ID',
                'Title',
                'Description',
                'Attachments',
                'Tags',
                'Latitude',
                'Longitude',
                'Location',
                'Proposed Budget',
                'Author name',
                'Author email',
                'Author ID',
                'Submitted at',
                'Published at',
                'Comments',
                'Likes',
                'Dislikes',
                'URL',
                'Project',
                'Status',
                'Assignee',
                'Assignee email'
              ],
              rows: [
                [
                  idea.id,
                  idea.title_multiloc['en'],
                  'It would improve the air quality!', # html tags are removed
                  '',
                  '',
                  idea.location_point.coordinates.last,
                  idea.location_point.coordinates.first,
                  idea.location_description,
                  idea.proposed_budget,
                  idea.author_name,
                  idea.author.email,
                  idea.author_id,
                  an_instance_of(DateTime), # created_at
                  an_instance_of(DateTime), # published_at
                  0,
                  0,
                  0,
                  "http://example.org/ideas/#{idea.slug}",
                  project.title_multiloc['en'],
                  idea.idea_status.title_multiloc['en'],
                  nil,
                  nil
                ]
              ]
            }
          ])
        end
      end
    end

    post 'web_api/v1/projects' do
      with_options scope: :project do
        parameter :title_multiloc, 'The title of the project, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the project, as a multiloc HTML string', required: true
        parameter :description_preview_multiloc, 'The description preview of the project, as a multiloc string'
        parameter :slug, 'The unique slug of the project. If not given, it will be auto generated'
        parameter :header_bg, 'Base64 encoded header image'
        parameter :area_ids, 'Array of ids of the associated areas'
        parameter :topic_ids, 'Array of ids of the associated topics'
        parameter :visible_to, "Defines who can see the project, either #{Project::VISIBLE_TOS.join(',')}. Defaults to public.", required: false
        parameter :folder_id, 'The ID of the project folder (can be set to nil for top-level projects)', required: false
        parameter :default_assignee_id, 'The user id of the admin or moderator that gets assigned to ideas by default. Defaults to unassigned', required: false
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
            assert_status 201

            json_response                    = json_parse(response_body)
            response_resource_id             = json_response.dig(:data, :id)
            admin_publication_ordering       = last_project.admin_publication.ordering
            admin_publication_parent         = last_project.admin_publication.parent

            expect(response_resource_id).to eq last_project.id
            expect(admin_publication_ordering).to eq 0
            expect(admin_publication_parent).to eq project_folder.admin_publication
          end

          example_request 'Adds all folder moderators as moderators of the project' do
            assert_status 201

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
            assert_status 401
          end
        end
      end
    end

    patch 'web_api/v1/projects/:id' do
      describe do
        let(:project) { create(:project) }
        let(:id) { project.id }

        example_request 'It does not authorize the folder moderator' do
          assert_status 401
        end
      end
    end

    delete 'web_api/v1/projects/:id' do
      describe do
        let(:project) { create(:project) }
        let(:id) { project.id }

        example_request 'It does not authorize the folder moderator' do
          assert_status 401
        end
      end
    end

    post 'web_api/v1/projects/:id/copy' do
      let!(:project_in_folder_user_moderates) { create(:single_phase_ideation_project, folder: project_folder) }
      let!(:project_in_other_folder) { create(:single_phase_ideation_project, folder: create(:project_folder)) }
      let!(:other_folder_moderators) { create_list(:project_folder_moderator, 3, project_folders: [project_folder]) }

      context 'when passing the id of project in a folder the user moderates' do
        let(:id) { project_in_folder_user_moderates.id }

        example_request 'Allows the copying of a project within a folder the user moderates' do
          assert_status 201

          copied_project = Project.find(json_response.dig(:data, :id))
          expect(copied_project.title_multiloc['en']).to include(project_in_folder_user_moderates.title_multiloc['en'])
        end

        example_request 'Adds all folder moderators as moderators of the project' do
          assert_status 201

          response_resource_id = json_response.dig(:data, :id)
          project_moderators = User.project_moderator(response_resource_id)
          folder_moderators = User.project_folder_moderator(project_folder.id)

          expect(project_moderators.pluck(:id)).to match_array folder_moderators.pluck(:id)
        end
      end

      context 'when passing the id of project in a folder the user does not moderate' do
        let(:id) { project_in_other_folder.id }

        example_request 'It does not authorize the folder moderator' do
          assert_status 401
        end
      end
    end
  end

  get 'web_api/v1/projects/with_active_participatory_phase' do
    before do
      @user = create(:user, roles: [])
      header_token_for @user
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of projects per page'
    end

    let!(:active_ideation_project) { create(:project_with_active_ideation_phase) }
    let!(:endless_project) { create(:single_phase_ideation_project) }

    let!(:active_information_project) { create(:project_with_past_ideation_and_current_information_phase) }
    let!(:past_project) { create(:project_with_two_past_ideation_phases) }
    let!(:future_project) { create(:project_with_future_native_survey_phase) }

    example_request 'Lists only projects with an active participatory phase' do
      expect(status).to eq 200

      json_response = json_parse(response_body)
      project_ids = json_response[:data].pluck(:id)

      expect(project_ids).to include active_ideation_project.id
      expect(project_ids).to include endless_project.id

      expect(project_ids).not_to include active_information_project.id
      expect(project_ids).not_to include past_project.id
      expect(project_ids).not_to include future_project.id
    end

    example_request 'Lists only projects with published publication status' do
      expect(status).to eq 200

      json_response = json_parse(response_body)
      project_ids = json_response[:data].pluck(:id)
      admin_publications = AdminPublication.where(publication_id: project_ids)

      expect(admin_publications.pluck(:publication_status)).to all(be_in(['published']))
    end

    example "List is ordered by end_at of project's active phase (ASC NULLS LAST)" do
      soonest_end_at = active_ideation_project.phases.first.end_at

      active_project2 = create(:project_with_active_ideation_phase)
      active_project2.phases.first.update!(end_at: soonest_end_at + 1.day)
      active_project3 = create(:project_with_active_ideation_phase)
      active_project3.phases.first.update!(end_at: soonest_end_at + 2.days)

      do_request
      expect(status).to eq 200

      json_response = json_parse(response_body)
      project_ids = json_response[:data].pluck(:id)
      projects = project_ids.map { |id| Project.find(id) }

      active_phases_end_ats = projects.map do |p|
        p.phases.where(
          'phases.start_at <= ? AND (phases.end_at >= ? OR phases.end_at IS NULL)',
          Time.zone.now.to_fs(:db), Time.zone.now.to_fs(:db)
        ).pluck(:end_at)
      end.flatten

      active_phases_end_ats.each_with_index do |end_at, index|
        if index.zero?
          expect(end_at).not_to be_nil
        else
          is_expected_order = end_at.nil? || end_at >= active_phases_end_ats[index - 1]
          expect(is_expected_order).to be true
        end
      end
    end

    # Excludes projects with active phase with all group permissions that exclude user
    # Includes projects with one permission that includes user

    example 'Includes related avatars', document: false do
      create(:idea, project: active_ideation_project, author: @user)

      do_request
      expect(status).to eq(200)
      json_response = json_parse(response_body)

      included_avatar_ids = json_response[:included].select { |d| d[:type] == 'avatar' }.pluck(:id)
      avatar_ids = json_response[:data].map { |d| d.dig(:relationships, :avatars, :data) }.flatten.pluck(:id)

      expect(avatar_ids).to include @user.id
      expect(included_avatar_ids).to include @user.id
    end

    example 'Includes project images', document: false do
      project_image = create(:project_image, project: active_ideation_project)

      do_request
      expect(status).to eq(200)
      json_response = json_parse(response_body)

      included_image_ids = json_response[:included].select { |d| d[:type] == 'image' }.pluck(:id)

      expect(included_image_ids).to include project_image.id
    end

    example_request 'Includes current phase', document: false do
      expect(status).to eq(200)
      json_response = json_parse(response_body)

      current_phase_ids = json_response[:data].filter_map { |d| d.dig(:relationships, :current_phase, :data, :id) }
      included_phase_ids = json_response[:included].select { |d| d[:type] == 'phase' }.pluck(:id)

      expect(current_phase_ids).to match included_phase_ids
    end

    # This test is helps ensure that we don't make the query chain more complex without realizing.
    example_request 'Action does not invoke unnecessary queries' do
      create(:project_image, project: active_ideation_project)

      # We need a participant, to get some included avatar data
      create(:idea, project: active_ideation_project, author: @user)

      expect { do_request(page: { size: 6, number: 1 }) }.not_to exceed_query_limit(21)

      assert_status 200
    end
  end
end
