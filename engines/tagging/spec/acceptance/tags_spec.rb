require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Tags" do

  explanation "Labels for processing content"

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get 'web_api/v1/tags' do
    before do
      Tagging::Tag.create(title_multiloc: { en: 'Fish' })
      Tagging::Tag.create(title_multiloc: { en: 'Sea Lion' })
      Tagging::Tag.create(title_multiloc: { en: 'Dolphin' })
      Tagging::Tag.create(title_multiloc: { en: 'Shark' })
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of tags per page'
    end
    parameter :search, 'Filter by code', required: false

    example_request 'List all tags' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
    end

    example 'Search for tags' do
      t1 = Tagging::Tag.create(title_multiloc: { en: 'Avkdjsuz' })

      do_request search: 'Avkd'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0][:id]).to eq t1.id
    end
  end

  # get "/web_api/v1/generate_tag_assignment" do
  #   before do
  #     @ideas = create_list(:idea, 2, title_multiloc: {'en' => 'I\'m an idea.'})
  #     Tagging::Tag.create(title_multiloc: {'en' => 'label'})
  #     Tagging::Tag.create(title_multiloc: {'en' => 'item'})
  #     @tags = Tagging::Tag.all()
  #   end
  #   parameter :idea_ids, 'The ideas to suggest tags for', required: true
  #   parameter :tag_ids, 'The tags assign', required: true
  #   parameter :locale, 'Locale', required: true
  #   let(:idea_ids) { @ideas.map(&:id) }
  #   let(:tag_ids) { @tags.map(&:id) }
  #   let(:locale) { 'en' }
  #
  #   describe do
  #     example "generate tags" do
  #       response = [
  #         {
  #         "predicted_labels" => [{"confidence" => 0.599170446395874, "id" => @tags.first.id}],
  #         "id" => @ideas.first.id,
  #         }
  #       ]
  #       allow_any_instance_of(NLP::TagAssignmentSuggestionService).to receive(:suggest).and_return(response)
  #    do_request
  #
  #       expect(status).to eq 200
  #       expect(@ideas.first.tags.first.id).to eq @tags.first.id
  #     end
  #   end
  # end
end
