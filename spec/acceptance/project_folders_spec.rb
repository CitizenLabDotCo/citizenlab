require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ProjectFolder' do
  explanation "A grouping of projects"

  before do
    header "Content-Type", "application/json"

    @projects = ['published','published','draft','published','archived','archived','published']
      .map { |ps|  create(:project, publication_status: ps)}
    @folders = [create(:project_folder, projects: @projects.take(3)), create(:project_folder, projects: [@projects.last])]
    ProjectHolderService.new.fix_project_holder_orderings!
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
      ValidationErrorHelper.new.error_fields(self, ProjectFolder)

      let(:title_multiloc) { {"en" => "Folder title" } }
      let(:description_multiloc) { {"en" => "Folder desc" } }
      let(:description_preview_multiloc) { {"en" => "Folder short desc" } }

      example_request "Create a folder" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    patch "web_api/v1/project_folders/:id" do
      with_options scope: :project_folder do
        parameter :title_multiloc, "The title of the folder"
        parameter :description_multiloc, "HTML info about the folder"
        parameter :description_preview_multiloc, "Text info about the folder"
        parameter :header_bg, "Base64 encoded header image"
      end
      ValidationErrorHelper.new.error_fields(self, ProjectFolder)

      let(:project_folder) { @folders.last }
      let(:id) { project_folder.id }
      let(:title_multiloc) { {'en' => "The mayor's favourites"} }
      let(:description_multiloc) { {'en' => "An ultimate selection of the mayor's favourite projects!"} }

      example_request "Update a folder" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
      end
    end

    delete "web_api/v1/project_folders/:id" do
      let(:project_folder) { @folders.first }
      let!(:id) { project_folder.id }

      example "Delete a folder" do
        old_count = ProjectFolder.count
        old_pho_count = ProjectHolderOrdering.count
        project_ids = project_folder.projects.published.order(:ordering).ids
        do_request
        expect(response_status).to eq 200
        expect{ProjectFolder.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(ProjectFolder.count).to eq (old_count - 1)

        # Two projects should have moved to the bottom as published, preserving relative ordering
        expect(ProjectHolderOrdering.count).to eq (old_pho_count + 1)
        # Doesn't work (CL2-4916)
        # expect(ProjectHolderOrdering.order(:ordering).last(2).map(&:project_holder_id)).to eq project_ids
      end
    end

  end

end
