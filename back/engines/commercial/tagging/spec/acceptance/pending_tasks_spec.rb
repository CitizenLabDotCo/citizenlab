require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'PendingTask' do
  explanation 'Labels for processing content'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get 'web_api/v1/pending_tasks' do
    before do
      create_list(:idea, 2)
      @ideas = create_list(:idea, 5)
      Tagging::Tag.create(title_multiloc: { en: 'NOO' })

      @tags = [Tagging::Tag.create(title_multiloc: { en: 'Fish' }),
              Tagging::Tag.create(title_multiloc: { en: 'Sea Lion' }),
              Tagging::Tag.create(title_multiloc: { en: 'Dolphin' }),
              Tagging::Tag.create(title_multiloc: { en: 'Shark' })]
      Tagging::PendingTask.create(nlp_task_id: 'lalalala', tag_ids: @tags.map(&:id), idea_ids: @ideas.map(&:id))
    end

    parameter :search, 'Search entry', required: false

    example_request 'List all pending tasks' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
      expect(json_response[:data][0].dig(:relationships, :ideas, :data).map{ |i| i[:id]}).to match_array @ideas.map(&:id)
      expect(json_response[:data][0].dig(:relationships, :tags, :data).map{ |i| i[:id]}).to match_array @tags.map(&:id)
    end
  end
end
