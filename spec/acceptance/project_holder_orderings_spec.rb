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
    end

    get "web_api/v1/projects" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of projects per page"
      end
      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :publication_statuses, "Return only ideas with the specified publication statuses (i.e. given an array of publication statuses); returns all pusblished ideas by default", required: false
      parameter :filter_can_moderate, "Filter out the projects the user is allowed to moderate. False by default", required: false

      example_request "List all published projects (default behaviour)" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 4
        expect(json_response[:data].map { |d| d.dig(:attributes,:publication_status) }).to all(eq 'published')
      end

      example "List all draft or archived projects", document: false do
        do_request(publication_statuses: ['draft','archived'])
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].map { |d| d.dig(:attributes,:publication_status) }).not_to include('published')
      end
    end

    patch "web_api/v1/projects/:id/reorder" do
      with_options scope: :project do
        parameter :ordering, "The position, starting from 0, where the project should be at. Projects after will move down.", required: true
      end

      before do
        Project.all.each(&:destroy!)
      end
      describe do
        let!(:id) { create_list(:project, 5).first.id }
        let(:ordering) { 2 }

        example "Reorder a project" do
          old_second_project = Project.find_by(ordering: ordering)
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data,:attributes,:ordering)).to match ordering
          expect(Project.find_by(ordering: 2).id).to eq id
          expect(old_second_project.reload.ordering).to eq 3 # previous second is now third
        end
      end
    end
  end
end
