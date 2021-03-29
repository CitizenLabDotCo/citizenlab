require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Mentions" do

  explanation "Part of a text that explicitly references a user."

  before do
    @current_user = create(:user)
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end

  get "web_api/v1/mentions/users" do
    parameter :mention, "The (partial) search string for the mention (without the @)", required: true
    parameter :post_id, "An post that is used as a context to return related users first", required: false
    parameter :post_type, "The type of post, either 'Idea' or 'Initiative'", required: false
    parameter :limit, "The number of results to return", required: false

    let(:users) { [create(:user, first_name: 'Flupke')] + create_list(:user, 9, last_name: 'Smith') }
    let(:mention) { users.first.first_name[0..3] }

    example_request "Find user by (partial) mention" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to be >= 1
      expect(json_response[:data].all?{|u| u[:attributes][:first_name][0..3] == mention}).to be true
    end

    example "Find user by (partial) mention and idea context" do
      first_name = 'Jozefius'
      idea = create(:idea)
      comments = 3.times.map do
        user = create(:user, first_name: first_name)
        create(:comment, post: idea, author: user)
      end
      comment = create(:comment, post: idea)
      author_not_mentioned = comment.author

      idea_related = comments.map(&:author)
      
      do_request post_id: idea.id, post_type: 'Idea', mention: first_name

      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq idea_related.size
      expect(json_response[:data].map{|d| d[:id]}).to match_array idea_related.map(&:id)
      expect(json_response[:data].all?{|u| u[:attributes][:first_name][0..(first_name.size)] == first_name}).to be true
    end
  end
end
