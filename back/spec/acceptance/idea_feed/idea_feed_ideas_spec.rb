# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea feed ideas' do
  explanation 'Returns ideas in the specific order for the idea_feed participation method'
  header 'Content-Type', 'application/json'

  get 'web_api/v1/phases/:phase_id/idea_feed/ideas' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of ideas per page'
    end

    let(:phase) { create(:idea_feed_phase) }
    let(:phase_id) { phase.id }
    let!(:ideas) { create_list(:idea, 2, project: phase.project, phases: [phase]) }
    let!(:other_idea) { create(:idea) }

    example_request 'List all ideas' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq(2)
    end
  end
end
