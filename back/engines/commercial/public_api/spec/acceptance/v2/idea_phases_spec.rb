# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Posts' do
  include_context 'common_auth'

  get '/api/v2/idea_phases' do
    route_summary 'List relations between ideas and phases'
    route_description <<~DESC.squish
      Idea phases represent associations between ideas and phases. This is a
      many-to-many relationship: Ideas can belong to multiple phases, and phases can
      be associated with multiple ideas. Basket & vote counts on this object represent
      the votes cast on an idea within a particular voting phase.
    DESC

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

    let(:project) { create(:project_with_phases) }
    let(:ideas) { create_list(:idea, 2, project: project) }
    let!(:idea_phases) do
      2.times do |index|
        ideas[index].update!(phases: [project.phases[index]])
      end
      IdeasPhase.all
    end

    example_request 'List all associations between ideas and phases' do
      assert_status 200
      associations = json_response_body[:idea_phases].map { |ip| [ip[:idea_id], ip[:phase_id]] }
      expected_associations = idea_phases.map { |ip| [ip.idea_id, ip.phase_id] }
      expect(associations).to match_array(expected_associations)
      expect(json_response_body[:idea_phases].first.keys).to match_array(%i[phase_id idea_id baskets_count votes_count created_at updated_at])
    end

    describe 'when filtering by idea ID' do
      let(:idea_id) { idea_phases.first.idea_id }

      example_request 'List only idea-phase associations for the specified idea', document: false do
        assert_status 200
        expect(json_response_body[:idea_phases].pluck(:phase_id)).to contain_exactly(idea_phases.first[:phase_id])
      end
    end

    describe 'when filtering by phase ID' do
      let(:phase_id) { idea_phases.first.phase_id }

      example_request 'List only idea-phase associations for the specified phase', document: false do
        assert_status 200
        expect(json_response_body[:idea_phases].pluck(:idea_id)).to contain_exactly(idea_phases.first[:idea_id])
      end
    end
  end
end
