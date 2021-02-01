# frozen_string_literal: true

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
      @ideas = create_list(:idea, 5)

      tags = [Tagging::Tag.create(title_multiloc: { en: 'Fish' }),
              Tagging::Tag.create(title_multiloc: { en: 'Sea Lion' }),
              Tagging::Tag.create(title_multiloc: { en: 'Dolphin' }),
              Tagging::Tag.create(title_multiloc: { en: 'Shark' })]
      Tagging::PendingTask.create(nlp_task_id: 'lalalala', tag_ids: tags.map(&:id), idea_ids: @ideas.map(&:id))
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of tags per page'
    end
    parameter :search, 'Search entry', required: false

    example_request 'List all tags' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
    end
  end
end
