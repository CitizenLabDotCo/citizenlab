# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Posts' do
  include_context 'common_auth'

  parameter(
    :idea_id,
    'Filter by idea ID',
    required: false,
    type: :string,
    in: :query
  )

  parameter(
    :phase_id,
    'Filter by phase ID',
    required: false,
    type: :string,
    in: :query
  )

  get '/api/v2/idea_phases' do
    route_summary 'List relations between ideas and phases'
    route_description <<~DESC.squish
      Idea phases represent associations between ideas and phases. This is a
      many-to-many relationship: Ideas can belong to multiple phases, and phases can
      be associated with multiple ideas. Basket & vote counts on this object represent
      the votes cast on an idea within a particular voting phase.
    DESC

    let(:date) { '2023-09-22T09:00:00.200Z' }
    let(:project) { create(:project_with_phases) }
    let(:ideas) { create_list(:idea, 2, project: project) }
    let!(:idea_phases) do
      2.times do |index|
        create(:ideas_phase, idea: ideas[index], phase: project.phases[index], created_at: date, updated_at: date)
      end
      IdeasPhase.all
    end

    example_request 'List all associations between ideas and phases' do
      assert_status 200

      expected_idea_phases = idea_phases.map do |idea_phase|
        {
          phase_id: idea_phase.phase_id,
          idea_id: idea_phase.idea_id,
          baskets_count: 0,
          votes_count: 0,
          created_at: date,
          updated_at: date
        }
      end

      expect(json_response_body[:idea_phases]).to match_array(expected_idea_phases)
    end

    describe 'when filtering by idea ID' do
      let(:idea_id) { ideas.first.id }

      example_request 'List only idea-phase associations for the specified idea', document: false do
        assert_status 200

        expected_idea_phases = ideas.first.phase_ids.map do |phase_id|
          { phase_id: phase_id, idea_id: idea_id, baskets_count: 0, votes_count: 0, created_at: date, updated_at: date }
        end

        expect(json_response_body[:idea_phases]).to match_array(expected_idea_phases)
      end
    end

    describe 'when filtering by phase ID' do
      let(:phase_id) { project.phases.first.id }

      example_request 'List only idea-phase associations for the specified phase', document: false do
        assert_status 200

        expected_idea_phases = [{
          phase_id: phase_id, idea_id: ideas.first.id, baskets_count: 0, votes_count: 0, created_at: date, updated_at: date
        }]

        expect(json_response_body[:idea_phases]).to match_array(expected_idea_phases)
      end
    end
  end
end
