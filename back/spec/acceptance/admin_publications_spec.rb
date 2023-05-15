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
      admin_header_token
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

        expect(json_response[:status_counts][:draft]).to eq 2
        expect(json_response[:status_counts][:archived]).to eq 2

        expect(json_response[:status_counts][:published]).to eq 3
      end
    end
  end

  context 'when resident' do
    before { resident_header_token }

    let(:project_statuses) { %w[published published draft draft published archived] }
    let!(:_custom_folder) { create(:project_folder, projects: projects.take(3)) }

    get 'web_api/v1/admin_publications' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of projects per page'
      end
      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :publication_statuses, 'Return only publications with the specified publication statuses (i.e. given an array of publication statuses); always includes folders; returns all publications by default', required: false
      parameter :filter_empty_folders, 'Filter out folders with no visible children for the current user', required: false
      parameter :folder, 'Filter by folder (project folder id)', required: false

      example 'Listed admin publications have correct visible children count', document: false do
        do_request(folder: nil)
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('folder')).to eq 1
        expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :type) }.count('project')).to eq 2
        expect(json_response[:data].find { |d| d.dig(:relationships, :publication, :data, :type) == 'folder' }.dig(:attributes, :visible_children_count)).to eq 2
      end

      example 'Visible children count should take account with applied filters', document: false do
        projects.first.admin_publication.update! publication_status: 'archived'
        do_request(folder: nil, publication_statuses: ['published'])
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
            build(:layout, craftjs_jsonmultiloc: { en: { someid: { props: { text: 'sometext' } } } })
          ])
          create(:project, content_builder_layouts: [
            build(:layout, craftjs_jsonmultiloc: { en: { sometext: { props: { text: 'othertext' } } } })
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
        expect(json_response[:status_counts][:draft]).to be_nil
        expect(json_response[:status_counts][:published]).to eq 2

        expect(json_response[:status_counts][:archived]).to eq 1
      end
    end
  end

  context 'when project folder moderator' do
    let(:folder) { create(:project_folder) }

    before do
      header_token_for create(:project_folder_moderator, project_folders: [folder])

      @projects = %w[published published draft draft published archived archived published]
        .map { |ps| create(:project, admin_publication_attributes: { publication_status: ps, parent_id: folder.admin_publication.id }) }
      @folder = create(:project_folder, projects: @projects.take(3))
      @empty_draft_folder = create(:project_folder, admin_publication_attributes: { publication_status: 'draft' })
    end

    patch 'web_api/v1/admin_publications/:id/reorder' do
      with_options scope: :admin_publication do
        parameter :ordering, 'The position, starting from 0, where the folder or project should be at. Publications after will move down.', required: true
      end

      describe do
        # getting the first publication, which should have ordering = 0
        let(:publication) { folder.admin_publication.children.first }
        let(:id) { publication.id }
        let(:publication_ordering) { 0 }

        let(:ordering) { 1 }

        # getting the second publication, which should have ordering = 1
        let(:second_publication) { folder.admin_publication.children.second }
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
end
