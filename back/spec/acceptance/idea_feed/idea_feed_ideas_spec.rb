# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea feed ideas' do
  explanation 'Returns ideas in the specific order for ideation phases with idea_feed ideation method'
  header 'Content-Type', 'application/json'

  get 'web_api/v1/phases/:phase_id/idea_feed/ideas' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of ideas per page'
    end
    parameter :topics, 'Filter by topic IDs', required: false

    let(:phase) { create(:idea_feed_phase) }
    let(:phase_id) { phase.id }
    let!(:ideas) { create_list(:idea, 2, project: phase.project, phases: [phase]) }
    let!(:other_idea) { create(:idea) }

    example_request 'List all ideas' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq(2)
    end

    describe 'filtering by topic' do
      let(:topic) { create(:input_topic, project: phase.project) }
      let(:topics) { [topic.id] }
      let!(:idea_with_topic) { create(:idea, project: phase.project, phases: [phase], input_topics: [topic]) }

      before do
        phase.project.input_topics << topic
      end

      example_request 'List ideas filtered by topic' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq(1)
        expect(json_response[:data][0][:id]).to eq(idea_with_topic.id)
      end
    end
  end
end
