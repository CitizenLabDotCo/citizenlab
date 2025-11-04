# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase participation' do
  before { admin_header_token }

  get 'web_api/v1/phases/:id' do
    let(:phase) { create(:phase) }
    let!(:idea) { create_list(:idea, 3, phases: [phase], project: phase.project) }

    let(:id) { phase.id }

    example_request 'Get a phase with participation data' do
      assert_status 200
      participations = json_response_body.dig(:data, :attributes, :participation)
      expect(participations.dig(:participations, :count)).to eq 3
      expect(participations.dig(:participants, :count)).to eq 3
    end
  end
end
