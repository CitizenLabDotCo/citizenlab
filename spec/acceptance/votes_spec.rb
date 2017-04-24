require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Votes" do
  before do
    header "Content-Type", "application/json"
    @idea = create(:idea)
    @votes = create_list(:vote, 2, votable: @idea)
  end

  context "when not authenticated" do
    get "api/v1/ideas/:idea_id/votes" do
      let(:idea_id) { @idea.id }

      example_request "List votes of an idea" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end

    get "api/v1/votes/:id" do
      let(:id) { @votes.first.id }

      example_request "Get one vote by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @votes.first.id
      end
    end
  end


  context "when authenticated" do
    before do
      @user = create(:user)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    # TODO: got an error that doesn't make sense for below test
    post "api/v1/ideas/:idea_id/votes" do
      with_options scope: :vote do
        parameter :user_id, "The user id of the user owning the vote. Signed in user by default", required: false
        parameter :mode, "one of [up, down]", required: true
      end
    
      let(:idea_id) { @idea.id }
      let(:mode) { "up" }
    
      example_request "Create a vote to an idea" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:relationships,:user,:data,:id)).to eq @user.id
        expect(json_response.dig(:data,:attributes,:mode)).to eq "up"
      end
    end

    delete "api/v1/votes/:id" do
      let(:vote) { create(:vote, user: @user, votable: @idea) }
      let(:id) { vote.id }
      example_request "Delete a vote" do
        expect(response_status).to eq 200
        expect{Vote.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
