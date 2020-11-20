require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Idea", admin_api: true do

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  let(:idea) { create(:idea_with_topics) }
  let(:idea_id ) { idea.id }

  get "admin_api/ideas/:idea_id" do
    example_request "Find an idea by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:idea][:id]).to eq idea_id
      expect(json_response[:idea][:title_multiloc].stringify_keys).to eq idea.title_multiloc
      expect(json_response[:idea][:body_multiloc].stringify_keys).to eq idea.body_multiloc
      expect(json_response[:idea][:topics].map{|t| t[:id]}).to match_array(idea.topic_ids)
      expect(json_response[:idea][:author][:id]).to eq idea.author_id
    end
  end

end