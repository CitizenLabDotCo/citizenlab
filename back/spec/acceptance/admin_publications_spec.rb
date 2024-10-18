# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'AdminPublication' do
  explanation 'Describes the presentation (ordering and publication) of a folder or project'

  before do
    header 'Content-Type', 'application/json'
  end

  let(:project_statuses) { %w[published published draft draft published archived archived published] }
  let!(:projects) do
    project_statuses.map { |ps| create(:project, admin_publication_attributes: { publication_status: ps }) }
  end
  let(:published_projects) { projects.select { |p| p.admin_publication.publication_status == 'published' } }
  let(:publication_ids) { response_data.map { |d| d.dig(:relationships, :publication, :data, :id) } }
  let!(:empty_draft_folder) { create(:project_folder, admin_publication_attributes: { publication_status: 'draft' }) }

  context 'when admin' do
    before do
      @admin = create(:admin)
      header_token_for(@admin)
    end

    # the name of this variable shouldn't be `folder`
    # because otherwise it will be used by default in `parameter :folder`
    let!(:custom_folder) { create(:project_folder, projects: projects.take(3)) }

    get 'web_api/v1/admin_publications' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of projects per page'
      end
      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :depth, 'Filter by depth', required: false
      parameter :search, 'Search text of title, description, preview, and slug', required: false
      parameter :publication_statuses, 'Return only publications with the specified publication statuses (i.e. given an array of publication statuses); always includes folders; returns all publications by default (OR)', required: false
      parameter :folder, 'Filter by folder (project folder id)', required: false
      parameter :remove_not_allowed_parents, 'Filter out folders which contain only projects that are not visible to the user', required: false
      parameter :only_projects, 'Include projects only (no folders)', required: false
      parameter :filter_can_moderate, 'Filter out the projects the current_user is not allowed to moderate. False by default', required: false
      parameter :filter_is_moderator_of, 'Filter out the publications the current_user is not moderator of. False by default', required: false
      parameter :filter_user_is_moderator_of, 'Filter out the publications the given user is moderator of (user id)', required: false

      example_request 'List all admin publications' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 10
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('project')).to eq 8
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('folder')).to eq 2
      end

      example 'List all top-level admin publications' do
        do_request(depth: 0)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 7
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('project')).to eq 5
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('folder')).to eq 2
      end

      example 'List all admin publications in a folder' do
        do_request(folder: custom_folder.id)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('folder')).to eq 0
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('project')).to eq 3
      end

      example 'List all draft or archived admin publications' do
        do_request(publication_statuses: %w[draft archived])
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :id) }).to match_array [empty_draft_folder.id, projects[2].id, projects[3].id, projects[5].id, projects[6].id]
        expect(json_response[:data].find { |d| d.dig(:relationships, :publication, :data, :type) == 'folder' }.dig(:attributes, :visible_children_count)).to eq 0
      end

      example_request 'List projects only' do
        do_request(only_projects: 'true')
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 8
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('project')).to eq 8
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('folder')).to eq 0
      end

      example 'List publications admin can moderate', document: false do
        do_request filter_can_moderate: true
        json_response = json_parse(response_body)
        assert_status 200
        expect(json_response[:data].size).to eq 10
      end

      example 'List publications a specific user can moderate', document: false do
        moderated_folder = create(:project_folder, projects: [projects[0], projects[1]])
        moderator = create(
          :user,
          roles: [
            { type: 'project_moderator', project_id: projects[0].id },
            { type: 'project_moderator', project_id: projects[1].id },
            { type: 'project_folder_moderator', project_folder_id: moderated_folder.id }
          ]
        )

        do_request filter_user_is_moderator_of: moderator.id
        assert_status 200
        expect(publication_ids).to match_array [projects[0].id, projects[1].id, moderated_folder.id]
      end

      context 'when admin is moderator of publications' do
        before do
          @moderated_project1 = published_projects[0]
          @moderated_project2 = published_projects[1]
          @moderated_folder1 = create(:project_folder, projects: [@moderated_project1])
          @moderated_folder2 = create(:project_folder)
          @admin.roles += [
            { type: 'project_moderator', project_id: @moderated_project1.id },
            { type: 'project_moderator', project_id: @moderated_project2.id },
            { type: 'project_folder_moderator', project_folder_id: @moderated_folder1.id },
            { type: 'project_folder_moderator', project_folder_id: @moderated_folder2.id }
          ]
          @admin.save!
        end

        example 'List publications admin is moderator of', document: false do
          do_request filter_is_moderator_of: true
          assert_status 200
          expect(publication_ids).to match_array [
            @moderated_project1.id, @moderated_project2.id, @moderated_folder1.id, @moderated_folder2.id
          ]
        end

        example 'List only projects admin is moderator of', document: false do
          do_request(filter_is_moderator_of: true, only_projects: true)
          assert_status 200
          expect(publication_ids).to match_array [@moderated_project1.id, @moderated_project2.id]
        end
      end

      ProjectsFilteringService::HOMEPAGE_FILTER_PARAMS.each do |filter_param|
        model_name_plural = filter_param.to_s
        model_name = model_name_plural.singularize

        describe "`#{model_name_plural}` parameter" do
          example "List all admin publications with the specified #{model_name_plural}" do
            m1 = create(model_name)
            m2 = create(model_name)

            p1 = published_projects[0]
            p1.update!(model_name_plural => [m1])

            p2 = published_projects[1]
            p2.update!(model_name_plural => [m2])

            do_request(model_name_plural => [m1.id])

            expect(response_data.size).to eq 2
            expect(publication_ids).to match_array [p1.id, custom_folder.id]
          end

          example "List admin publications representing folders that contain project(s) with the specified #{model_name_plural}" do
            m1 = create(model_name)
            create(model_name)
            project = custom_folder.projects.first
            project.update!(model_name_plural => [m1])

            do_request(model_name_plural => [m1.id])

            expect(publication_ids).to match_array([project.id, custom_folder.id])
          end
        end
      end

      example 'List all admin publications with all specified model filters' do
        # add more model filters in this spec and change the next expect if it fails (it means the constant was changed)
        expect(ProjectsFilteringService::HOMEPAGE_FILTER_PARAMS).to eq(%i[topics areas])

        topic = create(:topic)
        area = create(:area)
        published_projects[0].update!(topics: [topic], areas: [area])
        published_projects[1].update!(topics: [topic])
        published_projects[2].update!(areas: [area])

        do_request({ topics: [topic.id], areas: [area.id] })
        expect(publication_ids).to match_array [published_projects[0].id, custom_folder.id]
      end

      describe "showing empty folders (which don't have any projects)" do
        let!(:custom_folder) { create(:project_folder, projects: []) }

        example 'Show empty folder' do
          do_request
          expect(response_data.map { |d| d.dig(:relationships, :publication, :data, :id) }).to include custom_folder.id
        end

        ProjectsFilteringService::HOMEPAGE_FILTER_PARAMS.each do |filter_param|
          example "Don't show empty folder when filtering by #{filter_param}" do
            do_request(filter_param => ['any id'])
            expect(response_data.map { |d| d.dig(:relationships, :publication, :data, :id) }).not_to include custom_folder.id
          end
        end
      end

      context 'with specific publication orderings at different depths' do
        before do
          # Purposefully use orderings that don't reflect creation order, to avoid corect ordering due to creation order
          #
          # Modelling the structure:
          # P1 (project)
          # F1 (folder)
          # P2 (project)
          # F2 (folder)
          #  .. P3-f2 (project)
          #  .. P4-f2 (project)
          #  .. P5-f2 (project)
          # P6 (project)
          # P7 (project)
          # P8 (project)

          projects[7].update!(title_multiloc: { en: 'P1' })
          projects[7].admin_publication.insert_at(0)
          empty_draft_folder.update!(title_multiloc: { en: 'F1' })
          empty_draft_folder.admin_publication.insert_at(1)
          projects[5].update!(title_multiloc: { en: 'P2' })
          projects[5].admin_publication.insert_at(2)
          custom_folder.update!(title_multiloc: { en: 'F2' })
          custom_folder.admin_publication.insert_at(3)
          projects[1].update!(title_multiloc: { en: 'P3-f2' })
          projects[1].admin_publication.insert_at(0)
          projects[0].update!(title_multiloc: { en: 'P4-f2' })
          projects[0].admin_publication.insert_at(1)
          projects[2].update!(title_multiloc: { en: 'P5-f2' })
          projects[2].admin_publication.insert_at(2)
          projects[6].update!(title_multiloc: { en: 'P6' })
          projects[6].admin_publication.insert_at(4)
          projects[4].update!(title_multiloc: { en: 'P7' })
          projects[4].admin_publication.insert_at(5)
          projects[3].update!(title_multiloc: { en: 'P8' })
          projects[3].admin_publication.insert_at(6)
        end

        example 'List all root-level admin publications is ordered correctly', document: false do
          do_request(depth: 0)
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].map { |d| d.dig(:attributes, :publication_title_multiloc, :en) })
            .to eq(%w[P1 F1 P2 F2 P6 P7 P8])
        end

        example 'List only project publications maintains a flattened nested ordering', document: false do
          do_request(only_projects: 'true')
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].map { |d| d.dig(:attributes, :publication_title_multiloc, :en) })
            .to eq(%w[P1 P2 P3-f2 P4-f2 P5-f2 P6 P7 P8])
        end
      end
    end

    patch 'web_api/v1/admin_publications/:id/reorder' do
      with_options scope: :admin_publication do
        parameter :ordering, 'The position, starting from 0, where the folder or project should be at. Publications after will move down.', required: true
      end

      # we don't need any extra publications in this spec
      let(:empty_draft_folder) { nil }
      let(:custom_folder) { nil }

      let!(:projects) do
        Array.new(3) do |i|
          create(:project, admin_publication_attributes: { publication_status: 'published', ordering: i })
        end
      end

      let(:id) { AdminPublication.find_by(ordering: 2).id }
      let(:ordering) { 1 }

      example 'Reorder an admin publication' do
        old_second_publication = AdminPublication.find_by(ordering: ordering)
        do_request
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :ordering)).to eq ordering
        expect(json_response.dig(:data, :id)).to eq id

        expect(AdminPublication.find(id).ordering).to eq(ordering)
        expect(old_second_publication.reload.ordering).to eq 2 # previous second is now third
      end
    end

    get 'web_api/v1/admin_publications/:id' do
      let(:id) { projects.first.admin_publication.id }

      example_request 'Get one admin publication by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :id)).to eq projects.first.admin_publication.id
        expect(json_response.dig(:data, :relationships, :publication, :data, :type)).to eq 'project'
        expect(json_response.dig(:data, :relationships, :publication, :data, :id)).to eq projects.first.id
        expect(json_response.dig(:data, :attributes, :publication_slug)).to eq projects.first.slug
      end
    end

    get 'web_api/v1/admin_publications/status_counts' do
      example 'Get publication_status counts for top-level admin publications' do
        do_request(depth: 0)
        expect(status).to eq 200

        json_response = json_parse(response_body)

        expect(json_response[:data][:attributes][:status_counts][:draft]).to eq 2
        expect(json_response[:data][:attributes][:status_counts][:archived]).to eq 2

        expect(json_response[:data][:attributes][:status_counts][:published]).to eq 3
      end
    end
  end

  context 'when resident' do
    before { resident_header_token }

    let(:project_statuses) { %w[published published draft draft published archived] }
    let!(:_custom_folder) { create(:project_folder, projects: projects.take(3)) }
    let(:draft_project) { create(:project, slug: 'draft-project', admin_publication_attributes: { publication_status: 'draft' }) }
    let!(:folder_with_draft_project) { create(:project_folder, projects: [draft_project]) }

    get 'web_api/v1/admin_publications' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of projects per page'
      end
      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :publication_statuses, 'Return only publications with the specified publication statuses (i.e. given an array of publication statuses); always includes folders; returns all publications by default', required: false
      parameter :remove_not_allowed_parents, 'Filter out folders with no visible children for the current user', required: false
      parameter :folder, 'Filter by folder (project folder id)', required: false
      parameter :include_publications, 'Include the related publications and associated items', required: false

      example 'Listed admin publications have correct visible children count', document: false do
        do_request(folder: nil, remove_not_allowed_parents: true)
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        # Only 3 of initial 6 projects are not in folder
        expect(json_response[:data].size).to eq 3
        # Only 1 folder expected - Draft folder created at top of file is not visible to resident,
        # nor should a folder with only a draft project in it
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('folder')).to eq 1
        # 3 projects are inside folder, 3 top-level projects remain, of which 1 is not visible (draft)
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('project')).to eq 2
        # Only the two non-draft projects are visible to resident
        expect(json_response[:data].find { |d| d.dig(:relationships, :publication, :data, :type) == 'folder' }.dig(:attributes, :visible_children_count)).to eq 2
      end

      example 'Visible children count should take account with applied filters', document: false do
        projects.first.admin_publication.update! publication_status: 'archived'
        do_request(folder: nil, publication_statuses: ['published'], remove_not_allowed_parents: true)
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('folder')).to eq 1
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('project')).to eq 1
        expect(json_response[:data].find { |d| d.dig(:relationships, :publication, :data, :type) == 'folder' }.dig(:attributes, :visible_children_count)).to eq 1
      end

      context 'search param' do
        example 'Search param should return the proper projects and folders', document: false do
          p1 = create(
            :project,
            admin_publication_attributes: { publication_status: 'published' },
            title_multiloc: {
              en: 'super specific string 1'
            }
          )

          p2 = create(
            :project,
            admin_publication_attributes: { publication_status: 'published' },
            title_multiloc: {
              en: 'another-string'
            },
            description_multiloc: {
              en: 'super specific string 2'
            }
          )

          p3 = create(
            :project,
            admin_publication_attributes: { publication_status: 'archived' },
            title_multiloc: {
              en: 'other-string'
            }
          )

          f1 = create(
            :project_folder,
            admin_publication_attributes: { publication_status: 'published' },
            title_multiloc: {
              en: 'super specific string 3'
            }
          )

          f2 = create(
            :project_folder,
            admin_publication_attributes: { publication_status: 'published' },
            title_multiloc: {
              en: 'a different string 3'
            },
            description_multiloc: {
              en: 'super specific string description'
            }
          )

          f3 = create(
            :project_folder,
            admin_publication_attributes: { publication_status: 'archived' },
            title_multiloc: {
              en: 'other-string'
            }
          )

          do_request search: 'super specific string'
          expect(response_data.size).to eq 4
          expect(response_ids).to contain_exactly(
            p1.admin_publication.id,
            p2.admin_publication.id,
            f1.admin_publication.id,
            f2.admin_publication.id
          )
          expect(response_ids).not_to include p3.admin_publication.id
          expect(response_ids).not_to include f3.admin_publication.id
        end

        example 'searching with query and filtering by topic', document: false do
          topic = create(:topic)
          project_with_topic = create(:project, topics: [topic],
            admin_publication_attributes: { publication_status: 'published' },
            title_multiloc: {
              en: 'fancy title'
            })
          do_request search: 'fancy title', topics: [topic.id]
          expect(response_data.size).to eq 1
          expect(response_ids).to contain_exactly(project_with_topic.admin_publication.id)
        end

        example 'Search param should return a project within a folder', document: false do
          project_in_folder = create(
            :project,
            admin_publication_attributes: { publication_status: 'published' },
            title_multiloc: {
              en: 'title'
            },
            description_multiloc: {
              en: 'super specific string'
            }
          )

          folder = create(
            :project_folder,
            projects: [project_in_folder]
          )

          do_request search: 'super specific string'
          expect(response_data.size).to eq 1
          expect(response_ids).to contain_exactly(
            project_in_folder.admin_publication.id
          )
          expect(response_ids).not_to include folder.admin_publication.id
        end

        example 'Search param should return a project within a folder and folder', document: false do
          project_in_folder = create(
            :project,
            admin_publication_attributes: { publication_status: 'published' },
            title_multiloc: {
              en: 'title'
            },
            description_multiloc: {
              en: 'folder and project string'
            }
          )

          folder = create(
            :project_folder,
            projects: [project_in_folder],
            title_multiloc: {
              en: 'folder and project string'
            }
          )

          do_request search: 'folder and project string'
          expect(response_data.size).to eq 2
          expect(response_ids).to contain_exactly(
            project_in_folder.admin_publication.id,
            folder.admin_publication.id
          )
        end

        example 'Search project by content from content builder', document: false do
          project = create(:project, content_builder_layouts: [
            build(:layout, craftjs_json: { someid: { props: { text: { en: 'sometext' } } } })
          ])
          create(:project, content_builder_layouts: [
            build(:layout, craftjs_json: { sometext: { props: { text: { en: 'othertext' } } } })
          ])
          do_request search: 'sometext'

          expect(response_data.size).to eq 1
          expect(response_ids).to contain_exactly(project.admin_publication.id)
        end
      end

      example 'Returns an empty list success response when there are no publications', document: false do
        AdminPublication.publication_types.each { |claz| claz.all.each(&:destroy!) }
        do_request(publication_statuses: ['published'])
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 0
      end
    end
  end

  context 'when not logged in' do
    let(:project_statuses) { %w[published archived draft published archived] }
    let!(:_custom_folder) { create(:project_folder, projects: projects.take(2)) }

    get 'web_api/v1/admin_publications/status_counts' do
      example 'Get publication_status counts for top-level admin publications' do
        do_request(depth: 0)
        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response[:data][:attributes][:status_counts][:draft]).to be_nil
        expect(json_response[:data][:attributes][:status_counts][:published]).to eq 2

        expect(json_response[:data][:attributes][:status_counts][:archived]).to eq 1
      end
    end
  end

  context 'when project moderator' do
    get 'web_api/v1/admin_publications' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of projects per page'
      end
      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :depth, 'Filter by depth', required: false
      parameter :search, 'Search text of title, description, preview, and slug', required: false
      parameter :publication_statuses, 'Return only publications with the specified publication statuses (i.e. given an array of publication statuses); always includes folders; returns all publications by default (OR)', required: false
      parameter :folder, 'Filter by folder (project folder id)', required: false
      parameter :remove_not_allowed_parents, 'Filter out folders which contain only projects that are not visible to the user', required: false
      parameter :only_projects, 'Include projects only (no folders)', required: false
      parameter :filter_can_moderate, 'Filter out the projects the user is allowed to moderate. False by default', required: false
      parameter :filter_is_moderator_of, 'Filter out the publications the user is not moderator of. False by default', required: false

      before do
        @moderator = create(:project_moderator, projects: [published_projects[0], published_projects[1]])
        header_token_for(@moderator)
      end

      example 'List only the projects the current user is moderator of' do
        do_request(filter_is_moderator_of: true, only_projects: true)
        json_response = json_parse(response_body)
        assert_status 200
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :id) })
          .to match_array [published_projects[0].id, published_projects[1].id]
      end
    end
  end

  context 'when project folder moderator' do
    # We can't use :folder as will collide with param :folder
    let(:project_folder) { create(:project_folder) }

    before do
      @projects = %w[published published draft draft published archived archived published]
        .map { |ps| create(:project, admin_publication_attributes: { publication_status: ps, parent_id: project_folder.admin_publication.id }) }
      @folder = create(:project_folder, projects: @projects.take(3))
      @empty_draft_folder = create(:project_folder, admin_publication_attributes: { publication_status: 'draft' })
      @moderator = create(:project_folder_moderator, project_folders: [project_folder, @folder])

      @folder.projects.each do |project|
        @moderator.update!(roles: @moderator.roles += [{ type: 'project_moderator', project_id: project.id }])
      end

      header_token_for(@moderator)
    end

    get 'web_api/v1/admin_publications' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of projects per page'
      end
      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :depth, 'Filter by depth', required: false
      parameter :search, 'Search text of title, description, preview, and slug', required: false
      parameter :publication_statuses, 'Return only publications with the specified publication statuses (i.e. given an array of publication statuses); always includes folders; returns all publications by default (OR)', required: false
      parameter :folder, 'Filter by folder (project folder id)', required: false
      parameter :remove_not_allowed_parents, 'Filter out folders which contain only projects that are not visible to the user', required: false
      parameter :only_projects, 'Include projects only (no folders)', required: false
      parameter :filter_can_moderate, 'Filter out the projects the user is allowed to moderate. False by default', required: false
      parameter :filter_is_moderator_of, 'Filter out the publications the user is not moderator of. False by default', required: false

      example 'List publications user is moderator of', document: false do
        do_request filter_is_moderator_of: true
        assert_status 200
        expect(publication_ids).to match_array [project_folder.id, @folder.id, @folder.projects.pluck(:id)].flatten
      end

      example 'List only projects user is moderator of' do
        do_request(filter_is_moderator_of: true, only_projects: true)
        assert_status 200
        expect(publication_ids).to match_array @folder.projects.pluck(:id)
      end
    end

    patch 'web_api/v1/admin_publications/:id/reorder' do
      with_options scope: :admin_publication do
        parameter :ordering, 'The position, starting from 0, where the folder or project should be at. Publications after will move down.', required: true
      end

      describe do
        # getting the first publication, which should have ordering = 0
        let(:publication) { project_folder.admin_publication.children.first }
        let(:id) { publication.id }
        let(:publication_ordering) { 0 }

        let(:ordering) { 1 }

        # getting the second publication, which should have ordering = 1
        let(:second_publication) { project_folder.admin_publication.children.second }
        let(:second_publication_ordering) { 1 }

        example 'Reorder an admin publication' do
          expect(publication.ordering).to eq publication_ordering
          expect(second_publication.ordering).to eq second_publication_ordering

          do_request
          new_ordering = json_parse(response_body).dig(:data, :attributes, :ordering)

          expect(response_status).to eq 200
          expect(new_ordering).to eq second_publication_ordering
          expect(second_publication.reload.ordering).to eq publication_ordering
        end
      end
    end
  end

  context "when include_publications parameter is 'true'" do
    shared_examples 'include_publications' do
      get 'web_api/v1/admin_publications' do
        parameter :include_publications, 'Include the related publications and associated items', required: false

        example ':include_publications includes the related publications & expected associations', document: false do
          project = create(:project_with_active_ideation_phase)
          project_image = create(:project_image, project: project)
          folder = create(:project_folder)
          folder_image = create(:project_folder_image, project_folder: folder)

          # We need a participant, to get some included avatar data
          participant = create(:user)
          create(:idea, project: project, author: participant)

          do_request include_publications: 'true'
          expect(status).to eq(200)
          json_response = json_parse(response_body)

          relationships_data = json_response[:data].map { |d| d.dig(:relationships, :publication, :data) }

          related_project_ids = relationships_data.select { |d| d[:type] == 'project' }.pluck(:id)
          related_folder_ids = relationships_data.select { |d| d[:type] == 'folder' }.pluck(:id)

          included_projects = json_response[:included].select { |d| d[:type] == 'project' }
          included_folder_ids = json_response[:included].select { |d| d[:type] == 'folder' }.pluck(:id)
          included_phase_ids = json_response[:included].select { |d| d[:type] == 'phase' }.pluck(:id)
          included_avatar_ids = json_response[:included].select { |d| d[:type] == 'avatar' }.pluck(:id)
          included_image_ids = json_response[:included].select { |d| d[:type] == 'image' }.pluck(:id)

          current_phase_ids = included_projects.filter_map { |d| d.dig(:relationships, :current_phase, :data, :id) }
          avatar_ids = included_projects.map { |d| d.dig(:relationships, :avatars, :data) }.flatten.pluck(:id)

          expect(related_project_ids).to match included_projects.pluck(:id)
          expect(related_folder_ids).to match included_folder_ids
          expect(current_phase_ids).to match included_phase_ids
          expect(avatar_ids).to match included_avatar_ids
          expect(included_image_ids).to include project_image.id
          expect(included_image_ids).to include folder_image.id
        end
      end
    end

    describe 'when admin' do
      before do
        @admin = create(:admin)
        header_token_for(@admin)
      end

      include_examples 'include_publications'
    end

    describe 'when project moderator' do
      before do
        @moderator = create(:project_moderator, projects: [published_projects[0], published_projects[1]])
        header_token_for(@moderator)
      end

      include_examples 'include_publications'
    end

    describe 'when project folder moderator' do
      before do
        @moderator = create(:project_folder_moderator, project_folders: [create(:project_folder)])
        header_token_for(@moderator)
      end

      include_examples 'include_publications'
    end

    describe 'when resident' do
      before { resident_header_token }

      include_examples 'include_publications'

      get 'web_api/v1/admin_publications' do
        with_options scope: :page do
          parameter :number, 'Page number'
          parameter :size, 'Number of projects per page'
        end
        parameter :depth, 'Filter by depth', required: false
        parameter :publication_statuses, 'Return only publications with the specified publication statuses (i.e. given an array of publication statuses); always includes folders; returns all publications by default (OR)', required: false
        parameter :remove_not_allowed_parents, 'Filter out folders which contain only projects that are not visible to the user', required: false
        parameter :include_publications, 'Include the related publications and associated items', required: false

        example_request 'Index action does invoke unnecessary queries' do
          project = create(:project_with_active_ideation_phase)
          create(:project_image, project: project)
          folder = create(:project_folder)
          create(:project_folder_image, project_folder: folder)

          # We need a participant, to get some included avatar data
          participant = create(:user)
          create(:idea, project: project, author: participant)

          puts "Projects: #{Project.count}"
          puts "Folders: #{ProjectFolders::Folder.count}"

          # There is probably lots more that could be done to improve the query count here, but this test
          # is here to help ensure that we don't make things worse.
          #
          # Down from 138, before adding more items to @publications = @publications.includes(...) in TAN-2806 #9110
          # in the case where we make use of the include_publications parameter
          expect do
            do_request(
              page: { size: 6, number: 1 },
              depth: 0,
              remove_not_allowed_parents: 'true',
              publication_statuses: %w[published archived],
              include_publications: 'true'
            )
          end.not_to exceed_query_limit(121)

          assert_status 200
        end
      end
    end

    describe 'when not logged in' do
      include_examples 'include_publications'
    end
  end
end
