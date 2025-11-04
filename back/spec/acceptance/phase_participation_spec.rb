require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase participation' do
  before { admin_header_token }

  get 'web_api/v1/phases/:id' do
    context 'voting phase' do
      let(:phase) { create(:phase, participation_method: 'voting', voting_method: 'single_voting') }
      let!(:ideas) { create_list(:idea, 3, phases: [phase], project: phase.project) }
      let!(:basket1) { create(:basket, phase: phase, user: create(:user)) }
      let!(:basket2) { create(:basket, phase: phase, user: create(:user)) }

      let(:id) { phase.id }

      example_request 'Get a phase with participation data' do
        assert_status 200
        participations = json_response_body.dig(:data, :attributes, :participation)
        expect(participations.dig(:participations, :count)).to eq 2
        expect(participations.dig(:participants, :count)).to eq 2
      end
    end
  end
end
