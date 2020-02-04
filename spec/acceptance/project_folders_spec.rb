require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ProjectFolder' do
  explanation "A grouping of projects"

  before do
    header "Content-Type", "application/json"
  end

  context 'when admin' do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"

      @projects = ['published','published','draft','published','archived','archived','published']
        .map { |ps|  create(:project, publication_status: ps)}
    end

    post 'web_api/v1/project_folders' do
      with_options scope: :project_folder do
        parameter :title_multiloc, "The title of the folder", required: true
        parameter :description_multiloc, "HTML info about the folder", required: false
        parameter :description_preview_multiloc, "Text info about the folder", required: false
      end
      ValidationErrorHelper.new.error_fields(self, ProjectFolder)

      let(:title_multiloc) { {"en" => "Folder title" } }
      let(:description_multiloc) { {"en" => "Folder desc" } }
      let(:description_preview_multiloc) { {"en" => "Folder short desc" } }

      example_request "Create an project_folder" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
      end
    end

  end

end
