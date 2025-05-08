# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative '../shared/errors_examples'
require_relative 'shared/parameters'

resource 'Ideas' do
  header 'Content-Type', 'application/json'

  post 'web_api/v1/phases/:phase_id/inputs/copy' do
    extend SharedParameters
    define_filter_params(scope: :filters)

    let(:from_phase) { create(:phase) }
    let(:to_phase) { create(:phase) }

    let(:phase_id) { to_phase.id }
    let(:phase) { from_phase.id }
    let!(:ideas) { create_list(:idea, 3, phases: [from_phase]) }

    context 'when regular user' do
      before { header_token_for create(:user) }

      include_examples 'unauthorized'
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'Copy ideas into the target phase' do
        expect(status).to eq(200)
        expect(to_phase.ideas.size).to eq(ideas.size)
      end
    end
  end
end
