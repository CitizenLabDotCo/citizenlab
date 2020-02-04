require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "ProjectHolderOrderings" do

  explanation "Either a project folder or a top-level published project"

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
      @folder = create(:folder, projects: [@projects.take(2)])
      ProjectHolderService.new.fix_project_holder_orderings!
    end

    get "web_api/v1/project_holder_orderings" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of projects per page"
      end

      example_request "List all project holder orderings" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map { |d| d.dig(:attributes,:project_holder_type) }.count('Folder')).to eq 1
        expect(json_response[:data].map { |d| d.dig(:attributes,:project_holder_type) }.count('Project')).to eq 2
      end
    end

    patch "web_api/v1/project_holder_orderings/:id/reorder" do
      with_options scope: :project do
        parameter :ordering, "The position, starting from 0, where the top-level folder or project should be at. Project holders after will move down.", required: true
      end

      describe do
        let(:id) { ProjectHolderOrdering.find_by(ordering: 3).id }
        let(:ordering) { 2 }

        example "Reorder a project" do
          old_second_project = ProjectHolderOrdering.find_by(ordering: ordering)
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:ordering)).to match ordering
          expect(ProjectHolderOrdering.find_by(ordering: ordering).id).to eq id
          expect(old_second_project.reload.ordering).to eq 3 # previous second is now third
        end
      end
    end
  end
end
