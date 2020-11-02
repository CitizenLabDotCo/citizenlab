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

  get "/web_api/v1/generate_tag_assignment" do
    before do
      @ideas = create_list(:idea, 2, title_multiloc: {'en' => 'I\'m an idea.'})
      Tag.create(title_multiloc: {'en' => 'label'})
      Tag.create(title_multiloc: {'en' => 'item'})
      @tags = Tag.all()
    end
    parameter :idea_ids, 'The ideas to suggest tags for', required: true
    parameter :tag_ids, 'The tags to suggest topics for', required: true
    parameter :locale, 'Locale', required: true
    let(:idea_ids) { @ideas.map(&:id) }
    let(:tag_ids) { @tags.map(&:id) }
    let(:locale) { 'en' }

    describe do
      example "generate tags" do
        response = [
          {
          "predicted_labels" => [{"confidence" => 0.599170446395874, "id" => @tags.first.id}],
          "id" => @ideas.first.id,
          }
        ]
        allow_any_instance_of(NLP::TagAssignmentSuggestionService).to receive(:suggest).and_return(response)
     do_request

        expect(status).to eq 200
        expect(@ideas.first.tags.first.id).to eq @tags.first.id
      end
    end
  end
end
