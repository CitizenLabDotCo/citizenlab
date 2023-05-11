# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  before do
    @ideas = create_list(:idea, 5)
    api_token = PublicApi::ApiClient.create
    token = Knock::AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  explanation "Ideas are written inputs created by citizens. The endpoint returns ideas in the a descending 'trending' order, which means that the most relevant ideas at the moment of request will come out on top."

  route '/api/v1/ideas', 'Ideas: Listing ideas' do
    get 'Retrieve a listing of ideas' do
      parameter :page_size, 'The number of ideas that should be returned in one response. Defaults to 12, max 24', required: false, type: 'integer'
      parameter :page_number, 'The page to return. Defaults to page 1', required: false, type: 'integer'

      example_request 'Get the first page of trending ideas' do
        explanation 'Endpoint to retrieve citizen ideas. The most trending ideas are returned first. The endpoint supports pagination.'
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:ideas].size).to eq 5
        expect(json_response[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end

      example 'Native survey responses are not included' do
        IdeaStatus.create_defaults
        create(:idea, project: create(:continuous_native_survey_project))

        do_request

        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:ideas].size).to eq 5
      end

      example 'Get the second page of trending ideas' do
        do_request('page_number' => 2, 'page_size' => 3)
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:ideas].size).to eq 2
        expect(json_response[:meta]).to eq({ total_pages: 2, current_page: 2 })
      end
    end
  end

  route '/api/v1/ideas/:idea_id', 'Ideas: Retrieve one idea' do
    parameter :idea_id, 'The unique ID indentifying the idea', type: 'string', required: true

    get 'Retrieve one idea' do
      let(:idea_id) { @ideas.first.id }

      example_request 'Get one idea by id' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:idea][:id]).to eq idea_id
      end
    end
  end
end
