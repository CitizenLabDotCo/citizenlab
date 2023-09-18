# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'IdeasPhases' do
  explanation 'An IdeasPhase represents that an idea belongs to a phase. If this phase is a voting phase, the number of votes and baskets is also stored in the IdeasPhase.'

  before do
    header 'Content-Type', 'application/json'
    @ideas_phases = create_list(:ideas_phase, 3)
  end

  context 'when not logged in' do
    get 'web_api/v1/ideas_phases/:id' do
      let(:id) { @ideas_phases.first.id }

      example_request 'Get one ideas_phase by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @ideas_phases.first.id
      end
    end
  end
end