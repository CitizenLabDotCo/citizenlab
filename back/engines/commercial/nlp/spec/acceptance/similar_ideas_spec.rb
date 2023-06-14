# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'SimilarIdeas' do
  explanation 'Returns ideas that are semantically similar to a given idea'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get '/web_api/v1/ideas/:idea_id/similar' do
    before do
      @ideas = create_list(:idea, 2)
      @idea = create(:idea)
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of campaigns per page'
    end

    describe do
      let(:idea_id) { @idea.id }

      example 'List all similar ideas' do
        allow_any_instance_of(NLP::Api).to receive(:similarity).and_return(@ideas.map do |i|
          { 'id' => i.id, 'score' => 0.27 }
        end)
        do_request
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end
  end
end
