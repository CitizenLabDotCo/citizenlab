require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "TagSuggestion" do

  explanation "Takes ideas, ask NLP for tag suggestions, create automatic tags and return them."

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get "/web_api/v1/tag_suggestions" do
    before do
      @ideas = create_list(:idea, 2, title_multiloc: {'en' => 'I\'m an idea.'})
    end
    parameter :idea_ids, 'The ideas to suggest tags for', required: true
    let(:idea_ids) { @ideas.map(&:id) }

    describe do

      example "returns tag suggestions" do
        allow_any_instance_of(NLP::TagSuggestionService).to receive(:suggest).and_return([
        {
          "text" => "kaggle",
          "frequency" => 11
        },
        {
          "text" => "google",
          "frequency" => 10
        }])
        do_request

        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end
  end
end
