# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phases::IdeasOrder' do
  before do
    header 'Content-Type', 'application/json'
  end

  context 'As an admin' do
    before do
      admin_header_token
      create(:phase, :with_ideas, ideas_order: 'oldest')
    end

    patch 'web_api/v1/phases/:phase_id/ideas_order' do
      with_options scope: :phase do
        parameter :ideas_order, 'The default order of ideas.'
      end

      let(:ideas_order) { 'most_recent' }
      let(:phase_id) { Phase.first.id }
      let(:phase) { Phase.find(phase_id) }

      example_request 'Update a phase\'s order of Ideas to most recent' do
        expect(response_status).to eq 200

        ordered_ideas_ids = Idea.joins(:ideas_phases)
                                .merge(IdeasPhase.where(phase: phase))
                                .order_by_most_recent.pluck(:id)

        response_idea_ids = json_parse(response_body).yield_self do |json|
          json.dig(:data, :relationships, :ideas, :data).map { |obj| obj[:id] }
        end

        expect(response_idea_ids).to eq ordered_ideas_ids
      end
    end
  end
end
