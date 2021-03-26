require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Projects" do

  before do
    @projects = create_list(:project, 5)
    api_token = PublicApi::ApiClient.create
    token = Knock::AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  explanation "Projects are participation scopes defined by the city. They define a context and set time and input expectations towards the citizens, stimulating them to engage in a the scoped debate. Citizens can post ideas in projects."

  route "/api/v1/projects", "Projects: Listing projects" do


    get "Retrieve a listing of projects" do

      parameter :page_size, "The number of projects that should be returned in one response. Defaults to 12, max 24", required: false, type: 'integer'
      parameter :page_number, "The page to return. Defaults to page 1", required: false, type: 'integer'

      example_request "Get the first page of projects" do
        explanation "Endpoint to retrieve city projects. The newest projects are returned first. The endpoint supports pagination."
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:projects].size).to eq Project.count
        expect(json_response[:meta]).to eq({total_pages: 1, current_page: 1})
      end

      example "Get the second page of projects" do
        do_request("page_number" => 2, "page_size" => 3)
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:projects].size).to eq 2
        expect(json_response[:meta]).to eq({total_pages: 2, current_page: 2})
      end

    end
  end


  route "/api/v1/projects/:id", "Projects: Retrieve one project" do

    get "Retrieve one project" do
      let(:id) {@projects.first.id}

      example_request "Get one project by id" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:project][:id]).to eq id
      end
    end

  end

end