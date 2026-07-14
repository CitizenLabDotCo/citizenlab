# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phases' do
  explanation 'Timeline projects consist of multiple phases through which ideas can transit.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/projects/:project_id/phases' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of phases per page'
    end
    parameter :placement_type, "Which phases to return: 'on_timeline' (default), 'standalone', or 'all'.", required: false

    let(:json_response) { json_parse(response_body) }
    let(:project) { create(:project) }
    let(:project_id) { project.id }
    let!(:phases) { create_list(:phase_sequence, 2, project: project) }

    context 'when visitor' do
      before { Permissions::PermissionsUpdateService.new.update_all_permissions }

      example 'List all phases of a project' do
        do_request
        assert_status 200
        expect(json_response[:data].size).to eq 2
        expect(json_response[:included].pluck(:type)).to include 'permission'

        action_descriptors = json_response[:data].first[:attributes][:action_descriptors]
        expect(action_descriptors.keys).to match_array(%i[
          posting_idea commenting_idea reacting_idea comment_reacting_idea
          annotating_document taking_survey taking_poll voting volunteering
        ])
      end

      example 'List phases of a hidden (community_monitor) project' do
        project.update!(internal_role: 'community_monitor')
        do_request
        assert_status 200
        expect(json_response[:data].size).to eq 2
      end

      example 'List phases of an unlisted project', document: false do
        project.update!(listed: false)
        do_request
        assert_status 200
        expect(json_response[:data].size).to eq 2
      end
    end

    context 'when admin' do
      before { admin_header_token }

      # Voting phases so the vote/manual-vote attributes are serialized.
      let!(:phases) { create_list(:phase_sequence, 2, project: project, participation_method: 'voting', voting_method: 'single_voting') }

      example 'See the manual votes attributes' do
        create(:idea_status_proposed)
        admin = create(:admin)
        phase1, phase2 = phases
        phase1.set_manual_voters(10, admin)
        phase1.save!
        create(:idea, project: project, phases: [phase1], manual_votes_amount: 5)
        idea2 = create(:idea, project: project, phases: [phase1, phase2], manual_votes_amount: 3)
        phases.each(&:update_manual_votes_count!)
        create(:baskets_idea, basket: create(:basket, phase: phase1), idea: idea2, votes: 2)
        Basket.update_counts(phase1)

        do_request
        assert_status 200

        phase1_response = json_response[:data].find { |i| i[:id] == phase1.id }
        expect(phase1_response.dig(:attributes, :manual_voters_amount)).to eq 10
        expect(phase1_response.dig(:attributes, :manual_votes_count)).to eq 8
        expect(phase1_response.dig(:attributes, :votes_count)).to eq 2
        expect(phase1_response.dig(:attributes, :total_votes_amount)).to eq 10
        expect(phase1_response.dig(:relationships, :manual_voters_last_updated_by, :data, :id)).to eq admin.id
        expect(json_response[:included].find { |i| i[:id] == admin.id }&.dig(:attributes, :email)).to eq admin.email
        expect(phase1_response.dig(:attributes, :manual_voters_last_updated_at)).to be_present

        phase2_response = json_response[:data].find { |i| i[:id] == phase2.id }
        expect(phase2_response.dig(:attributes, :manual_voters_amount)).to be_nil
        expect(phase2_response.dig(:attributes, :manual_votes_count)).to eq 3
        expect(phase2_response.dig(:attributes, :votes_count)).to eq 0
        expect(phase2_response.dig(:attributes, :total_votes_amount)).to eq 3
        expect(phase2_response.dig(:relationships, :manual_voters_last_updated_by, :data, :id)).to be_nil
        expect(phase2_response.dig(:attributes, :manual_voters_last_updated_at)).to be_nil
      end
    end

    context 'filtering by placement_type' do
      before { admin_header_token }

      let!(:standalone) { create(:phase, :standalone, project: project, start_at: phases.first.start_at, end_at: phases.first.end_at) }

      example 'returns only on_timeline phases by default' do
        do_request
        assert_status 200
        expect(json_response[:data].pluck(:id)).to match_array phases.map(&:id)
      end

      example 'returns only standalone phases', document: false do
        do_request(placement_type: 'standalone')
        assert_status 200
        expect(json_response[:data].pluck(:id)).to eq [standalone.id]
      end

      example 'returns all phases, timeline phases first' do
        do_request(placement_type: 'all')
        assert_status 200
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].last[:id]).to eq standalone.id
      end
    end
  end
end
