# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects' do
  explanation 'Projects can have phases which can be of different participation methods.'

  shared_examples 'Unauthorized (401)' do
    example 'Unauthorized (401)', document: false do
      do_request
      expect(status).to eq 401
    end
  end

  shared_context 'PATCH project parameters' do
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
  end

  shared_context 'POST project parameters' do
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
  end

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

    let(:user) { @user }

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
          },
          preview_token: an_instance_of(String)
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
      include_context 'POST project parameters'

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
        let(:publication_status) { 'published' }
        let(:default_assignee_id) { create(:admin).id }

        example_request 'Create a timeline project' do
          assert_status 201

          new_project = Project.find(response_data[:id])

          expect(response_data[:attributes]).to include(
            title_multiloc: title_multiloc.symbolize_keys,
            description_multiloc: description_multiloc.symbolize_keys,
            description_preview_multiloc: description_preview_multiloc.symbolize_keys,
            visible_to: visible_to,
            first_published_at: new_project.admin_publication.first_published_at.iso8601(3),
            header_bg: be_present
          )

          expect(json_response.dig(:data, :relationships, :areas, :data).pluck(:id)).to match_array area_ids
          expect(json_response.dig(:data, :relationships, :topics, :data).pluck(:id)).to match_array topic_ids
          expect(json_response.dig(:data, :relationships, :default_assignee, :data, :id)).to eq default_assignee_id

          admin_publication_attrs = json_response[:included].find { |its| its[:type] == 'admin_publication' }[:attributes]
          expect(admin_publication_attrs[:publication_status]).to eq('published')

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
      include_context 'PATCH project parameters'

      before { @project = create(:project) }

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

      context 'when the homepage layout references the project or its admin_publication' do
        let!(:project2) { create(:project) }

        let!(:layout) do
          create(
            :homepage_layout,
            craftjs_json: {
              ROOT: {
                type: 'div',
                nodes: %w[
                  nUOW77iNcW
                  lsKEOMxTkR
                ],
                props: {
                  id: 'e2e-content-builder-frame'
                },
                custom: {},
                hidden: false,
                isCanvas: true,
                displayName: 'div',
                linkedNodes: {}
              },
              nUOW77iNcW: {
                type: {
                  resolvedName: 'Selection'
                },
                nodes: [],
                props: {
                  titleMultiloc: {
                    en: 'Projects and folders'
                  },
                  adminPublicationIds: [
                    project.admin_publication.id,
                    project2.admin_publication.id
                  ]
                },
                custom: {},
                hidden: false,
                parent: 'ROOT',
                isCanvas: false,
                displayName: 'Selection',
                linkedNodes: {}
              },
              lsKEOMxTkR: {
                type: {
                  resolvedName: 'Spotlight'
                },
                nodes: [],
                props: {
                  publicationId: project.id,
                  titleMultiloc: {
                    en: 'Highlighted project'
                  },
                  publicationType: 'project',
                  buttonTextMultiloc: {
                    en: 'Look at this project!'
                  },
                  descriptionMultiloc: {
                    en: 'some description text'
                  }
                },
                custom: {},
                hidden: false,
                parent: 'ROOT',
                isCanvas: false,
                displayName: 'Spotlight',
                linkedNodes: {}
              }
            }
          )
        end

        example 'Deleting removes any Spotlight widget(s) for the project from the homepage layout', document: false do
          do_request
          expect(layout.reload.craftjs_json['lsKEOMxTkR']).to be_nil
        end

        example 'References to deleted homepage layout Spotlight widgets are also removed', document: false do
          do_request
          expect(layout.reload.craftjs_json['ROOT']['nodes']).to eq %w[nUOW77iNcW]
        end

        example(
          'Deleting removes its admin_publication ID from Selection widget(s) in homepage layout',
          document: false
        ) do
          do_request

          expect(response_status).to eq 200
          expect(layout.reload.craftjs_json['nUOW77iNcW']['props']['adminPublicationIds'])
            .to match_array [project2.admin_publication.id]
        end
      end
    end

    delete 'web_api/v1/projects/:id/participation_data' do
      let(:project) { create(:project) }
      let(:id) { project.id }
      let(:ideation_phase) do
        create(
          :phase,
          project: project,
          participation_method: 'ideation',
          start_at: (Time.zone.today - 40.days),
          end_at: (Time.zone.today - 31.days)
        )
      end

      let(:volunteering_phase) do
        create(
          :volunteering_phase,
          project: project,
          start_at: (Time.zone.today - 30.days),
          end_at: (Time.zone.today - 21.days)
        )
      end

      let(:poll_phase) do
        create(
          :poll_phase,
          project: project,
          start_at: (Time.zone.today - 20.days),
          end_at: (Time.zone.today - 11.days)
        )
      end

      let!(:idea) { create(:idea, project: project) }

      let!(:cause) { create(:cause, phase: volunteering_phase) }

      let!(:volunteer) { create(:volunteer, cause: cause) }

      let!(:poll_response) { create(:poll_response, phase: poll_phase) }

      example 'Reset participation data of a project' do
        side_fx = SideFxProjectService.new
        allow(SideFxProjectService).to receive(:new).and_return(side_fx)
        expect(side_fx)
          .to receive(:after_destroy_participation_data).and_call_original

        do_request

        expect(response_status).to eq 200
        expect(project.ideas).to be_empty
        expect(cause.volunteers).to be_empty
        expect(poll_phase.poll_responses).to be_empty
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

      example 'Copy non-draft project', document: false do
        expect(source_project.admin_publication.publication_status).not_to eq 'draft'

        do_request
        assert_status 201

        copied_project = Project.find(json_response.dig(:data, :id))
        expect(copied_project.admin_publication.publication_status).to eq 'draft'
      end

      example 'Copy a project in a folder', document: false do
        folder = create(:project_folder, projects: [source_project])

        do_request
        assert_status 201

        copied_project = Project.find(json_response.dig(:data, :id))
        expect(copied_project.folder_id).to eq folder.id
      end

      example 'Copy a project with a project moderator as default_assignee', document: false do
        moderator = create(:project_moderator, projects: [source_project])
        source_project.update!(default_assignee: moderator)

        do_request
        assert_status 201

        copied_project = Project.find(json_response.dig(:data, :id))
        expect(copied_project.default_assignee_id).to eq @user.id
      end

      context 'as a project moderator' do
        before do
          header 'Content-Type', 'application/json'
          @user = create(:user, roles: [{ type: 'project_moderator', project_id: source_project.id }])
          header_token_for @user
        end

        example 'Copying a project in a folder copies to root', document: false do
          create(:project_folder, projects: [source_project])

          do_request
          assert_status 201

          copied_project = Project.find(json_response.dig(:data, :id))
          expect(copied_project.folder_id).to be_nil
        end
      end

      context 'as a folder moderator' do
        let(:folder) { create(:project_folder, projects: [source_project]) }

        before do
          header 'Content-Type', 'application/json'
          @user = create(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: folder.id }])
          header_token_for @user
        end

        example_request 'Copying a project in a folder copies to the same folder', document: false do
          assert_status 201

          copied_project = Project.find(json_response.dig(:data, :id))
          expect(copied_project.folder_id).to eq folder.id
        end
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
          phases: [ideation_phase, single_voting_phase],
          manual_votes_amount: 24
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

      before do
        config = AppConfiguration.instance
        config.settings['core']['private_attributes_in_export'] = true
        config.save!
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
              'Offline votes',
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
                24,
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
              'Offline votes',
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
                24,
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

      describe 'when a survey phase is changed to an ideation phase' do
        before do
          native_survey_phase.update!(participation_method: 'ideation')

          # Simulating a survey response with no content, which already
          # existed before the phase participation_method was changed.
          survey_response.title_multiloc = {}
          survey_response.body_multiloc = {}
          survey_response.save!(validate: false)
        end

        example_request 'Downloaded inputs do not include ideas with no content' do
          assert_status 200
          xlsx = xlsx_contents response_body
          expect(xlsx.size).to eq 3

          all_values = xlsx.flat_map { |sheet| sheet[:rows].flatten }
          expect(all_values).not_to include(survey_response.id)
        end
      end
    end
  end

  post 'web_api/v1/projects/:id/refresh_preview_token' do
    context 'when admin' do
      before do
        @admin = create(:admin)
        header_token_for(@admin)
      end

      let(:project) { create(:project) }
      let(:id) { project.id }

      example 'Refresh the preview token of a project' do
        expect { do_request }.to change { project.reload.preview_token }
        assert_status 200
      end
    end

    context 'when regular user' do
      before do
        @user = create(:user)
        header_token_for(@user)
      end

      let(:project) { create(:project) }
      let(:id) { project.id }

      example '[Unauthorized] Refresh the preview token of a project', document: false do
        do_request
        expect(status).to eq 401
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
          expected_first_columns + [french_column_headers['votes_count'], french_column_headers['manual_votes']] + expected_last_columns
        )
        expect(header_row2).to match_array(
          expected_first_columns +
          [french_column_headers['votes_count'], french_column_headers['participants'], french_column_headers['manual_votes']] +
          expected_last_columns
        )
        expect(header_row3).to match_array(
          expected_first_columns +
          [
            "#{french_column_headers['picks']} / #{french_column_headers['participants']}",
            french_column_headers['cost'],
            french_column_headers['manual_votes']
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

      context 'When community monitor project exists' do
        before { @projects << create(:community_monitor_project) }

        example 'Does not include hidden community monitor project by default', document: false do
          do_request filter_can_moderate: true, publication_statuses: AdminPublication::PUBLICATION_STATUSES
          assert_status 200
          expect(json_response[:data].size).to eq(@projects.size - 1)
          expect(response_data.map { |d| d.dig(:attributes, :slug) }).not_to include 'community-monitor'
        end

        example 'Return all projects including hidden community monitor project', document: false do
          do_request include_hidden: true, filter_can_moderate: true, publication_statuses: AdminPublication::PUBLICATION_STATUSES
          assert_status 200
          expect(json_response[:data].size).to eq @projects.size
          expect(response_data.map { |d| d.dig(:attributes, :slug) }).to include 'community-monitor'
        end
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

    get 'web_api/v1/projects/:id' do
      let(:id) { project.id }

      context 'when the project is in draft' do
        let_it_be(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }

        context 'and the project_preview_link feature flag is enabled' do
          before do
            settings = AppConfiguration.instance.settings
            settings['project_preview_link'] = { 'enabled' => true, 'allowed' => true }
            AppConfiguration.instance.update!(settings: settings)
          end

          context 'and a valid preview_token is provided in cookies' do
            before { header('Cookie', "preview_token=#{project.preview_token}") }

            example 'Get a project by id', document: false do
              do_request
              assert_status 200
              expect(json_response.dig(:data, :id)).to eq project.id
            end
          end

          context 'and an invalid preview_token is provided in cookies' do
            before { header('Cookie', 'preview_token=invalid') }

            include_examples 'Unauthorized (401)'
          end

          context 'and no preview_token is provided in cookies' do
            include_examples 'Unauthorized (401)'
          end
        end

        context 'and the project_preview_link feature flag is disabled and a valid preview_token is provided in cookies' do
          before { header('Cookie', "preview_token=#{project.preview_token}") }

          include_examples 'Unauthorized (401)'
        end
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
          expected_params = [[idea], project.phases.first]
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
                'Offline votes',
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
                  nil,
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
      include_context 'POST project parameters'

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

  delete 'web_api/v1/projects/:id' do
    context 'when project moderator' do
      before do
        header_token_for moderator
      end

      let(:moderator) { create(:project_moderator, projects: [project]) }
      let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
      let(:id) { project.id }

      example 'Delete a project that has never been published', document: false do
        do_request

        assert_status 200
        expect { Project.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      example '[Unauthorized] Delete a project that has been published', document: false do
        project.admin_publication.update!(first_published_at: Time.zone.now)

        do_request

        assert_status 401
        expect(Project.where(id: id)).to exist
      end
    end
  end

  patch 'web_api/v1/projects/:id' do
    include_context 'PATCH project parameters'

    context 'when project moderator' do
      before { header_token_for(moderator) }

      let(:moderator) { create(:project_moderator, projects: [project]) }
      let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
      let(:id) { project.id }

      context 'when the project has never been published' do
        before do # Sanity check
          raise 'Project should not have been published' if project.ever_published?
        end

        context 'and has not been approved' do
          before do
            create(:project_review, project: project)
          end

          example 'Cannot update the project status', document: false do
            # The request should be successful, but the parameter should be ignored.
            expect do
              do_request(project: { admin_publication_attributes: { publication_status: 'archived' } })
            end.not_to change { project.reload.admin_publication.publication_status }

            assert_status 200
          end
        end

        context 'and has been approved' do
          before do
            create(:project_review, :approved, project: project)
          end

          example 'Update the project status', document: false do
            expect do
              do_request(project: { admin_publication_attributes: { publication_status: 'published' } })
            end.to change { project.reload.admin_publication.publication_status }.from('draft').to('published')

            assert_status 200
          end
        end
      end

      context 'when the project has been published' do
        before { project.admin_publication.update!(first_published_at: Time.zone.now) }

        example 'Update the project status', document: false do
          expect do
            do_request(project: { admin_publication_attributes: { publication_status: 'published' } })
          end.to change { project.reload.admin_publication.publication_status }.from('draft').to('published')

          assert_status 200
        end
      end
    end
  end

  post 'web_api/v1/projects' do
    include_context 'POST project parameters'

    context 'when project moderator' do
      before { header_token_for moderator }

      let(:moderator) { create(:project_moderator) }
      let(:project_attrs) { attributes_for(:project) }
      let(:title_multiloc) { project_attrs[:title_multiloc] }
      let(:description_multiloc) { project_attrs[:description_multiloc] }

      # can create a draft project
      example 'Create a draft project', document: false do
        expect do
          do_request(project: { admin_publication_attributes: { publication_status: 'draft' } })
        end.to change(Project, :count).by(1)

        assert_status 201

        # The user should automatically be added as a project moderator
        project_id = response_data[:id]
        expect(moderator.reload).to be_project_moderator(project_id)
      end

      # cannot create a published project
      example '[Unauthorized] Create a published project', document: false do
        do_request(project: { admin_publication_attributes: { publication_status: 'published' } })
        assert_status 401
      end

      # cannot create a project in a folder
      example '[Unauthorized] Create a project in a folder', document: false do
        do_request(project: { folder_id: create(:project_folder).id })
        assert_status 401
      end
    end
  end

  post 'web_api/v1/projects/:id/copy' do
    let(:source_project) { create(:project) }
    let(:id) { source_project.id }

    context 'when project moderator' do
      before { header_token_for moderator }

      context 'when the user moderates the source project' do
        let(:moderator) { create(:project_moderator, projects: [source_project]) }

        example 'Copy a project', document: false do
          do_request
          assert_status 201

          copy_id = response_data[:id]
          expect(Project.where(id: copy_id)).to exist
        end

        example 'Copy a project in a folder', document: false do
          folder = create(:project_folder)
          source_project.update!(folder: folder)

          do_request
          assert_status 201

          copy_id = response_data[:id]
          expect(Project.find(copy_id).folder_id).to be_nil
        end
      end

      context 'when the user does not moderate the source project' do
        let(:moderator) { create(:project_moderator) }

        example '[Unauthorized] Copy a project', document: false do
          do_request
          assert_status 401
        end
      end
    end

    context 'when project folder moderator' do
      before { header_token_for moderator }

      context 'when the user moderates the folder of the source project' do
        let(:source_project) { create(:project, folder: create(:project_folder)) }
        let(:moderator) { create(:project_folder_moderator, project_folders: [source_project.folder]) }

        example 'Copy a project in the folder', document: false do
          do_request
          assert_status 201

          copy_id = response_data[:id]
          expect(Project.find(copy_id).folder_id).to eq(source_project.folder_id)
        end
      end

      context 'when the user does not moderate the folder of the source project' do
        let(:moderator) { create(:project_folder_moderator) }

        example '[Unauthorized] Copy a project in the folder', document: false do
          do_request
          assert_status 401
        end
      end
    end
  end

  get 'web_api/v1/projects/community_monitor' do
    context 'hidden project exists' do
      let!(:project) { create(:community_monitor_project) }

      context 'community monitor project ID already saved in settings' do
        example 'Community monitor project is returned' do
          do_request
          assert_status 200
        end
      end
    end

    context 'hidden project does not exist' do
      before { SettingsService.new.activate_feature! 'community_monitor' }

      context 'when resident' do
        example 'Error: Community monitor project not found' do
          do_request
          assert_status 404
        end
      end

      context 'when admin' do
        before { admin_header_token }

        example 'Community monitor project is created and returned' do
          do_request
          assert_status 200

          created_project = Project.first
          created_phase = Phase.first
          created_permission = Permission.first
          created_form = CustomForm.first
          expect(created_project.hidden).to be true
          expect(created_project.internal_role).to eq 'community_monitor'
          expect(created_project.title_multiloc['en']).to eq 'Community monitor'
          expect(created_phase.project).to eq created_project
          expect(created_phase.participation_method).to eq 'community_monitor_survey'
          expect(created_phase.title_multiloc['en']).to eq 'Community monitor'
          expect(created_permission.permission_scope).to eq created_phase
          expect(created_permission.permitted_by).to eq 'everyone'
          expect(created_form.participation_context).to eq created_phase
          expect(created_form.custom_fields.count).to eq 15

          settings = AppConfiguration.instance.settings
          expect(settings['community_monitor']['project_id']).to eq created_project.id
        end
      end
    end

    context 'when logged out resident' do
      context 'hidden community monitor project exists & everyone tracking enabled' do
        let!(:phase) do
          phase = create(:community_monitor_survey_phase, with_permissions: true)
          phase.permissions.first.update!(permitted_by: 'everyone', everyone_tracking_enabled: true)
          phase
        end

        example 'Get community monitor project' do
          do_request
          assert_status 200
        end

        context 'Survey has already been submitted' do
          let!(:response) { create(:native_survey_response, project: phase.project, creation_phase: phase, author: nil, author_hash: author_hash) }

          context 'when no consent given' do
            let(:author_hash) do
              # No consent hash based on ip and user agent
              user_agent = 'User-Agent: Mozilla/5.0'
              ip = '1.2.3.4'
              "n_#{Idea.create_author_hash(ip + user_agent, phase.project_id, true)}"
            end

            example 'Get community monitor project when survey already submitted without consent' do
              header 'User-Agent', 'User-Agent: Mozilla/5.0'
              header 'X-Forwarded-For', '1.2.3.4'
              do_request
              assert_status 200

              disabled_reason = response_data.dig(:attributes, :action_descriptors, :posting_idea, :disabled_reason)
              expect(disabled_reason).to eq 'posting_limited_max_reached'
            end
          end

          context 'when consent given - using hash from cookie' do
            let(:author_hash) { 'COOKIE_AUTHOR_HASH' }

            example 'Get community monitor project when survey already submitted with consent' do
              header('Cookie', "#{phase.id}={\"lo\": \"#{author_hash}\"};cl2_consent={\"analytics\": true}")
              do_request
              assert_status 200

              disabled_reason = response_data.dig(:attributes, :action_descriptors, :posting_idea, :disabled_reason)
              expect(disabled_reason).to eq 'posting_limited_max_reached'
            end
          end
        end
      end
    end
  end
end
