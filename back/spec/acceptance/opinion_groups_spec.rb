# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Opinion groups' do
  explanation 'Opinion groups of the participants of a phase, derived from their reactions.'

  before { header 'Content-Type', 'application/json' }

  let(:phase) { create(:common_ground_phase) }
  let(:phase_id) { phase.id }
  let(:statements) { create_list(:idea, 6, project: phase.project, phases: [phase]) }
  let(:camp1) { create_list(:user, 5) }
  let(:camp2) { create_list(:user, 5) }

  before do
    # Every user skips one statement, so that no two users vote identically.
    statements.each_with_index do |statement, j|
      camp1.each_with_index do |user, i|
        create(:reaction, reactable: statement, user: user, mode: j < 3 ? 'up' : 'down') unless i % 6 == j
      end
      camp2.each_with_index do |user, i|
        create(:reaction, reactable: statement, user: user, mode: j < 3 ? 'down' : 'up') unless i % 6 == j
      end
    end
  end

  get 'web_api/v1/phases/:phase_id/opinion_groups' do
    parameter :k, 'Fixed number of groups (2-5). Omit to select the number automatically.', required: false
    parameter :include_demographics, 'Add demographic features to the clustering (default: false)', required: false
    parameter :demographic_weight, 'Weight of the demographic features (0-5, default: 0.5)', required: false
    parameter :min_votes_per_participant, 'Participants with fewer reactions are left out (default: 3)', required: false
    parameter :min_votes_per_statement, 'Statements with fewer reactions are left out (default: 3)', required: false
    parameter :privacy_threshold, 'Demographic cells below this count are hidden (default: 5)', required: false

    context 'when admin' do
      before { admin_header_token }

      example_request 'Get the opinion groups of a phase' do
        assert_status 200
        expect(response_data[:type]).to eq 'opinion_groups'
        expect(response_data[:id]).to eq phase.id
        attributes = response_data[:attributes]
        expect(attributes[:stats][:group_count]).to eq 2
        expect(attributes[:groups].size).to eq 2
        expect(attributes[:points].size).to eq 10
        expect(attributes[:statements].size).to eq 6
        expect(attributes.keys).to include(:axes, :consensus, :divisive, :demographic_fields, :participation_balance, :parameters)
      end

      example 'Get a fixed number of opinion groups', document: false do
        do_request(k: 3, include_demographics: true)
        assert_status 200
        expect(response_data[:attributes][:stats][:group_count]).to eq 3
        expect(response_data[:attributes][:parameters][:include_demographics]).to be true
      end
    end

    context 'when project moderator' do
      before { header_token_for create(:project_moderator, projects: [phase.project]) }

      example_request 'Get the opinion groups of a phase', document: false do
        assert_status 200
      end
    end

    context 'when regular user' do
      before { header_token_for create(:user) }

      example_request '[error] Get the opinion groups of a phase', document: false do
        assert_status 401
      end
    end

    context 'when visitor' do
      example_request '[error] Get the opinion groups of a phase', document: false do
        assert_status 401
      end
    end
  end
end
