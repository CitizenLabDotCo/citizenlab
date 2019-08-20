require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Activities" do

  explanation "Activities capture interactions throughout the platform, like posting ideas, voting or editing/deleting content."

  get "web_api/v1/ideas/:idea_id/activities" do
    before do
      @idea = create(:idea)
      create(:published_activity, item: @idea)
      create(:changed_title_activity, item: @idea)
      create(:changed_body_activity, item: @idea)
      create(:changed_status_activity, item: @idea)
    end
    
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of activities per page"
    end

    let (:idea_id) { @idea.id }

    example_request "List all activities" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
    end
  end
end
