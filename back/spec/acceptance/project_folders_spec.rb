# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ProjectFolder' do
  explanation 'A grouping of projects'

  before do
    header 'Content-Type', 'application/json'

    @projects = %w[published published draft published archived archived published]
      .map { |ps|  create(:project, admin_publication_attributes: { publication_status: ps }) }
    @folders = [
      create(:project_folder, projects: @projects.take(3)),
      create(:project_folder, projects: [@projects.last])
    ]
  end

  get 'web_api/v1/project_folders' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of folders per page'
    end
    parameter :filter_ids, 'Filter out only folders with the given list of IDs', required: false

    example_request 'List all folders' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end

    example 'List only folders with specified IDs', document: true do
      filter_ids = [@folders.first.id]

      do_request(filter_ids: filter_ids)

      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data].pluck(:id)).to match_array filter_ids
    end
  end

  get 'web_api/v1/project_folders/:id' do
    let(:id) { @folders.first.id }

    before do
      Analytics::PopulateDimensionsService.populate_types
    end

    example_request 'Get one folder by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @folders.first.id
    end

    example 'Get a folder includes the participants_count and avatars_count', document: false do
      idea = create(:idea)
      folder = create(:project_folder, projects: [idea.project])
      do_request id: folder.id

      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :attributes, :participants_count)).to eq 1
      expect(json_response.dig(:data, :attributes, :avatars_count)).to eq 1
      expect(json_response.dig(:data, :relationships, :avatars)).to eq({ data: [{ id: idea.author_id, type: 'avatar' }] })
    end

    example 'Get a folder includes ideas_count, comments_count and followers_count', document: false do
      idea = create(:idea)
      create(:comment, idea: idea)
      draft_project = create(:project, admin_publication_attributes: { publication_status: 'draft' })
      create(:idea, project: draft_project)
      create(:comment)
      also_idea = create(:idea)
      folder = create(:project_folder, projects: [idea.project, also_idea.project, draft_project])
      create(:follower, followable: folder)
      do_request id: folder.id

      assert_status 200
      json_response = json_parse response_body
      expect(json_response.dig(:data, :attributes, :ideas_count)).to eq 2
      expect(json_response.dig(:data, :attributes, :comments_count)).to eq 1
      expect(json_response.dig(:data, :attributes, :followers_count)).to eq 1
    end
  end

  get 'web_api/v1/project_folders/by_slug/:slug' do
    let(:slug) { @folders.first.slug }

    example_request 'Get one folder by slug' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @folders.first.id
    end

    describe do
      let(:slug) { 'unexisting-folder' }

      example 'Get an unexisting folder by slug', document: false do
        do_request
        expect(status).to eq 404
      end
    end
  end

  context 'when admin' do
    before { header_token_for user }

    let(:user) { create(:admin) }

    get 'web_api/v1/project_folders' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of folders per page'
      end
      parameter :filter_ids, 'Filter out only folders with the given list of IDs', required: false

      example 'List all folders include followers', document: false do
        follower = create(:follower, followable: @folders.last, user: user)

        do_request

        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].filter_map { |d| d.dig(:relationships, :user_follower, :data, :id) }.first).to eq follower.id
      end
    end

    get 'web_api/v1/project_folders/for_admin' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of folders per page'
      end

      example_request 'List all folders for admin' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end

    post 'web_api/v1/project_folders' do
      with_options scope: :project_folder do
        parameter :title_multiloc, 'The title of the folder', required: true
        parameter :description_multiloc, 'HTML info about the folder', required: false
        parameter :description_preview_multiloc, 'Text info about the folder', required: false
        parameter :header_bg, 'Base64 encoded header image', required: false
      end
      with_options scope: %i[project_folder admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the folder, either #{AdminPublication::PUBLICATION_STATUSES.join(',')}. Defaults to published.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, ProjectFolders::Folder)

      let(:title_multiloc) { { 'en' => 'Folder title' } }
      let(:description_multiloc) { { 'en' => 'Folder desc' } }
      let(:description_preview_multiloc) { { 'en' => 'Folder short desc' } }
      let(:publication_status) { 'draft' }

      example_request 'Create a folder' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data, :attributes, :description_preview_multiloc).stringify_keys).to match description_preview_multiloc
        expect(json_response[:included].find { |inc| inc[:type] == 'admin_publication' }.dig(:attributes, :publication_status)).to eq 'draft'
        # New folders are added to the top
        expect(json_response[:included].find { |inc| inc[:type] == 'admin_publication' }.dig(:attributes, :ordering)).to eq 0
      end
    end

    patch 'web_api/v1/project_folders/:id' do
      with_options scope: :project_folder do
        parameter :title_multiloc, 'The title of the folder'
        parameter :description_multiloc, 'HTML info about the folder'
        parameter :description_preview_multiloc, 'Text info about the folder'
        parameter :header_bg, 'Base64 encoded header image'
      end
      with_options scope: %i[project_folder admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the folder, either #{AdminPublication::PUBLICATION_STATUSES.join(',')}.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, ProjectFolders::Folder)

      let(:project_folder) { @folders.last }
      let(:id) { project_folder.id }
      let(:title_multiloc) { { 'en' => "The mayor's favourites" } }
      let(:description_multiloc) { { 'en' => "An ultimate selection of the mayor's favourite projects!" } }
      let(:publication_status) { 'archived' }

      example 'Update a folder' do
        old_publcation_ids = AdminPublication.ids
        do_request

        expect(response_status).to eq 200
        # admin publications should not be replaced, but rather should be updated
        expect(AdminPublication.ids).to match_array old_publcation_ids
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response[:included].find { |inc| inc[:type] == 'admin_publication' }.dig(:attributes, :publication_status)).to eq 'archived'
      end

      describe do
        example 'The header image can be removed' do
          project_folder.update!(header_bg: Rails.root.join('spec/fixtures/header.jpg').open)
          expect(project_folder.reload.header_bg_url).to be_present
          do_request project_folder: { header_bg: nil }
          expect(project_folder.reload.header_bg_url).to be_nil
        end
      end
    end

    delete 'web_api/v1/project_folders/:id' do
      let(:project_folder) { @folders.first }
      let!(:id) { project_folder.id }
      let(:project_with_moderator) { project_folder.projects.first }

      example 'Delete a folder' do
        create_list(:project_folder_moderator, 3, project_folders: [project_folder])
        create(:project_moderator, projects: [project_with_moderator])
        old_count = ProjectFolders::Folder.count
        old_publications_count = AdminPublication.count
        old_project_count = Project.count
        expect(User.project_moderator(project_with_moderator.id).count).to eq 1

        do_request

        expect(response_status).to eq 200
        expect { ProjectFolders::Folder.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(ProjectFolders::Folder.count).to eq(old_count - 1)
        expect(AdminPublication.count).to eq(old_publications_count - 4)
        expect(Project.count).to eq(old_project_count - 3)
        expect(User.project_folder_moderator(id).count).to eq 0
        expect(User.project_moderator(project_with_moderator.id).count).to eq 0
      end

      context 'when the homepage layout references the folder, its admin_publication or its children' do
        let!(:project1) do
          create(:project, admin_publication_attributes: { parent_id: project_folder.admin_publication.id })
        end

        let!(:project2) do
          create(:project, admin_publication_attributes: { parent_id: project_folder.admin_publication.id })
        end

        let!(:project_folder2) { create(:project_folder) }

        let!(:project3) do
          create(:project, admin_publication_attributes: { parent_id: project_folder2.admin_publication.id })
        end

        let!(:layout) do
          create(
            :homepage_layout,
            craftjs_json: {
              ROOT: {
                type: 'div',
                nodes: %w[
                  nUOW77iNcW
                  VTKEOQmRdC
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
                    project_folder.admin_publication.id,
                    project1.admin_publication.id,
                    project2.admin_publication.id,
                    project_folder2.admin_publication.id,
                    project3.admin_publication.id
                  ]
                },
                custom: {},
                hidden: false,
                parent: 'ROOT',
                isCanvas: false,
                displayName: 'Selection',
                linkedNodes: {}
              },
              VTKEOQmRdC: {
                type: {
                  resolvedName: 'Spotlight'
                },
                nodes: [],
                props: {
                  publicationId: project_folder.id,
                  titleMultiloc: {
                    en: 'Project folder'
                  },
                  publicationType: 'folder',
                  buttonTextMultiloc: {
                    en: 'Look in this folder!'
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
              },
              lsKEOMxTkR: {
                type: {
                  resolvedName: 'Spotlight'
                },
                nodes: [],
                props: {
                  publicationId: project1.id,
                  titleMultiloc: {
                    en: 'Project in project_folder'
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

        example 'Deleting removes any Spotlight widget for the folder from the homepage layout', document: false do
          do_request
          expect(layout.reload.craftjs_json['VTKEOQmRdC']).to be_nil
        end

        example(
          'Deleting removes any Spotlight widget for ' \
          'a child of the folder from the homepage layout',
          document: false
        ) do
          do_request
          expect(layout.reload.craftjs_json['lsKEOMxTkR']).to be_nil
        end

        example 'References to deleted homepage layout Spotlight widgets are also removed', document: false do
          do_request
          expect(layout.reload.craftjs_json['ROOT']['nodes']).to eq %w[nUOW77iNcW]
        end

        example(
          "Deleting removes its and its children's admin_publication IDs" \
          'from Selection widget(s) in homepage layout',
          document: false
        ) do
          do_request

          expect(response_status).to eq 200
          expect(layout.reload.craftjs_json['nUOW77iNcW']['props']['adminPublicationIds'])
            .to match_array [project_folder2.admin_publication.id, project3.admin_publication.id]
        end
      end
    end
  end

  context 'when project folder moderator' do
    let(:moderated_folder) { create(:project_folder) }
    let!(:user) { create(:project_folder_moderator, project_folders: [moderated_folder]) }

    before do
      header_token_for(user)
    end

    post 'web_api/v1/project_folders' do
      with_options scope: :project_folder do
        parameter :title_multiloc, 'The title of the folder', required: true
        parameter :description_multiloc, 'HTML info about the folder', required: false
        parameter :description_preview_multiloc, 'Text info about the folder', required: false
        parameter :header_bg, 'Base64 encoded header image', required: false
      end

      with_options scope: %i[project_folder admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the folder, either #{AdminPublication::PUBLICATION_STATUSES.join(',')}. Defaults to published.", required: false
      end

      ValidationErrorHelper.new.error_fields(self, ProjectFolders::Folder)

      let(:title_multiloc) { { 'en' => 'Folder title' } }
      let(:description_multiloc) { { 'en' => 'Folder desc' } }
      let(:description_preview_multiloc) { { 'en' => 'Folder short desc' } }
      let(:publication_status) { 'draft' }

      example_request 'Create a folder' do
        expect(response_status).to eq 401
      end
    end

    patch 'web_api/v1/project_folders/:id' do
      with_options scope: :project_folder do
        parameter :title_multiloc, 'The title of the folder', required: true
        parameter :description_multiloc, 'HTML info about the folder', required: false
        parameter :description_preview_multiloc, 'Text info about the folder', required: false
        parameter :header_bg, 'Base64 encoded header image', required: false
      end

      with_options scope: %i[project_folder admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the folder, either #{AdminPublication::PUBLICATION_STATUSES.join(',')}. Defaults to published.", required: false
      end

      ValidationErrorHelper.new.error_fields(self, ProjectFolders::Folder)

      let(:title_multiloc) { { 'en' => 'Folder title' } }
      let(:description_multiloc) { { 'en' => 'Folder desc' } }
      let(:description_preview_multiloc) { { 'en' => 'Folder short desc' } }
      let(:publication_status) { 'draft' }

      example 'Update a folder the user moderates' do
        old_publcation_ids = AdminPublication.ids
        do_request id: moderated_folder.id

        expect(response_status).to eq 200
        # admin publications should not be replaced, but rather should be updated
        expect(AdminPublication.ids).to match_array old_publcation_ids

        json_response = json_parse(response_body)
        response_admin_publication = json_response[:included].find { |inc| inc[:type] == 'admin_publication' }
        attributes = json_response.dig(:data, :attributes)

        expect(attributes[:title_multiloc].stringify_keys).to match title_multiloc
        expect(attributes[:description_multiloc].stringify_keys).to match description_multiloc
        expect(response_admin_publication.dig(:attributes, :publication_status)).to eq publication_status
      end
    end

    delete 'web_api/v1/project_folders/:id' do
      let(:project_folder) { @folders.first }
      let!(:id) { project_folder.id }
      let!(:folder_moderators) { create_list(:project_folder_moderator, 3, project_folders: [project_folder]) }

      example 'Delete a folder' do
        do_request id: moderated_folder.id

        expect(response_status).to eq 401
      end
    end
  end
end
