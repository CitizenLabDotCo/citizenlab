require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ProjectFolder' do
  explanation "A grouping of projects"

  before do
    header "Content-Type", "application/json"

    @projects = ['published','published','draft','published','archived','archived','published']
      .map { |ps|  create(:project, admin_publication_attributes: {publication_status: ps})}
    @folders = [
      create(:project_folder, projects: @projects.take(3)),
      create(:project_folder, projects: [@projects.last])
    ]
  end

  get "web_api/v1/project_folders" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of folders per page"
    end
    parameter :filter_ids, "Filter out only folders with the given list of IDs", required: false

    example_request "List all folders" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end

    example "List only folders with specified IDs", document: true do
      filter_ids = [@folders.first.id]
      do_request(filter_ids: filter_ids)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data].map { |d| d.dig(:id) }).to match_array filter_ids
    end
  end

  get "web_api/v1/project_folders/:id" do
    let(:id) {@folders.first.id}

    example_request "Get one folder by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @folders.first.id
    end
  end

  get "web_api/v1/project_folders/by_slug/:slug" do
    let(:slug) { @folders.first.slug }

    example_request "Get one folder by slug" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @folders.first.id
    end

    describe do
      let(:slug) { "unexisting-folder" }
      example "Get an unexisting folder by slug", document: false do
        do_request
        expect(status).to eq 404
      end
    end
  end

  context 'when admin' do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post 'web_api/v1/project_folders' do
      with_options scope: :project_folder do
        parameter :title_multiloc, "The title of the folder", required: true
        parameter :description_multiloc, "HTML info about the folder", required: false
        parameter :description_preview_multiloc, "Text info about the folder", required: false
        parameter :header_bg, "Base64 encoded header image", required: false
      end
      with_options scope: [:project_folder, :admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the folder, either #{AdminPublication::PUBLICATION_STATUSES.join(",")}. Defaults to published.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, ProjectFolders::Folder)

      let(:title_multiloc) { {"en" => "Folder title" } }
      let(:description_multiloc) { {"en" => "Folder desc" } }
      let(:description_preview_multiloc) { {"en" => "Folder short desc" } }
      let(:publication_status) { 'draft' }

      example_request "Create a folder" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data,:attributes,:description_preview_multiloc).stringify_keys).to match description_preview_multiloc
        expect(json_response[:included].select{|inc| inc[:type] == 'admin_publication'}.first.dig(:attributes, :publication_status)).to eq 'draft'
        # New folders are added to the top
        expect(json_response[:included].select{|inc| inc[:type] == 'admin_publication'}.first.dig(:attributes, :ordering)).to eq 0
      end
    end

    patch "web_api/v1/project_folders/:id" do
      with_options scope: :project_folder do
        parameter :title_multiloc, "The title of the folder"
        parameter :description_multiloc, "HTML info about the folder"
        parameter :description_preview_multiloc, "Text info about the folder"
        parameter :header_bg, "Base64 encoded header image"
      end
      with_options scope: [:project_folder, :admin_publication_attributes] do
        parameter :publication_status, "Describes the publication status of the folder, either #{AdminPublication::PUBLICATION_STATUSES.join(",")}.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, ProjectFolders::Folder)

      let(:project_folder) { @folders.last }
      let(:id) { project_folder.id }
      let(:title_multiloc) { {'en' => "The mayor's favourites"} }
      let(:description_multiloc) { {'en' => "An ultimate selection of the mayor's favourite projects!"} }
      let(:publication_status) { 'archived' }

      example "Update a folder" do
        old_publcation_ids = AdminPublication.ids
        do_request

        expect(response_status).to eq 200
        # admin publications should not be replaced, but rather should be updated
        expect(AdminPublication.ids).to match_array old_publcation_ids
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response[:included].select{|inc| inc[:type] == 'admin_publication'}.first.dig(:attributes, :publication_status)).to eq 'archived'
      end
    end

    delete "web_api/v1/project_folders/:id" do
      let(:project_folder) { @folders.first }
      let!(:id) { project_folder.id }
      let!(:folder_moderators) { create_list(:project_folder_moderator, 3, project_folder: project_folder) }

      example "Delete a folder" do
        old_count = ProjectFolders::Folder.count
        old_publications_count = AdminPublication.count
        old_project_count = Project.count
        do_request

        expect(response_status).to eq 200
        expect { ProjectFolders::Folder.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(ProjectFolders::Folder.count).to eq(old_count - 1)
        expect(AdminPublication.count).to eq(old_publications_count - 4)
        expect(Project.count).to eq(old_project_count - 3)
        expect(User.project_folder_moderator(id).count).to eq 0
      end
    end
  end

  context 'when project folder moderator' do
    let(:moderated_folder) { create(:project_folder) }
    let!(:user) { create(:project_folder_moderator, project_folder: moderated_folder) }

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
        parameter :publication_status, "Describes the publication status of the folder, either #{AdminPublication::PUBLICATION_STATUSES.join(",")}. Defaults to published.", required: false
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
        parameter :publication_status, "Describes the publication status of the folder, either #{AdminPublication::PUBLICATION_STATUSES.join(",")}. Defaults to published.", required: false
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

        expect(attributes.dig(:title_multiloc).stringify_keys).to match title_multiloc
        expect(attributes.dig(:description_multiloc).stringify_keys).to match description_multiloc
        expect(response_admin_publication.dig(:attributes, :publication_status)).to eq publication_status
      end
    end

    delete 'web_api/v1/project_folders/:id' do
      let(:project_folder) { @folders.first }
      let!(:id) { project_folder.id }
      let!(:folder_moderators) { create_list(:project_folder_moderator, 3, project_folder: project_folder) }

      example 'Delete a folder' do
        do_request id: moderated_folder.id

        expect(response_status).to eq 401
      end
    end
  end
end
