# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/support/shared'

resource 'Ideas' do
  before do
    @ideas = create_list(:idea, 5)
    @ideas.each do |idea|
      idea.update!(custom_field_values: { 'audience_size' => rand(101...4000), 'audience_type' => 'young people' })
    end
    api_token = PublicApi::ApiClient.create
    token = Knock::AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  explanation "Ideas are written inputs created by citizens. The endpoint returns ideas in the a descending 'trending' order, which means that the most relevant ideas at the moment of request will come out on top."

  include_context 'common_parameters'

  # Only for ideas
  # folder_id
  # status
  # topic

  get '/api/v1/:locale/ideas/' do
    let(:locale) { 'en' }
    let(:page_size) { 2 }

    example_request 'Get a page of ideas' do
      explanation 'Endpoint to retrieve citizen ideas. The most trending ideas are returned first. The endpoint supports pagination.'
      assert_status 200
      expect(json_response_body[:ideas].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end
end
