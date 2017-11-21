require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Mentions" do

  before do
    @current_user = create(:user)
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end


  get "web_api/v1/mentions/users" do
    explanation "Returns the 5 best matches"

    parameter :mention, "The (partial) search string for the mention (without the @)", required: true
    parameter :idea_id, "An idea that is used as a context to return related users first", required: false

    let(:users) { create_list(:user, 10) }
    let(:mention) { users.first.first_name[0..3] }

    example_request "Find user by (partial) mention." do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to be >= 1
    end

    example "Find user by (partial) mention and idea context" do
      first_name = "jozefius"
      author = create(:user, first_name: first_name)
      idea = create(:idea, author: author)
      comments = 4.times.map do
        user = create(:user, first_name: first_name)
        create(:comment, idea: idea, author: user)
      end
      idea_related = [author, *comments.map(&:author)]
      
      do_request(idea_id: idea.id, mention: first_name)
      
      json_response = json_parse(response_body)
      expect(json_response[:data].map{|d| d[:id]}).to match_array idea_related.map(&:id)
    end
  end


end
