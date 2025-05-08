# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative 'shared/errors_examples'

resource 'Ideas' do
  before do
    header 'Content-Type', 'application/json'
  end

  post 'web_api/v1/phases/:to_phase_id/inputs/copy' do
    with_options scope: :filters do
      parameter :phase_id, 'The ID of the phase'
    end

    let(:from_phase) { create(:phase) }
    let(:to_phase) { create(:phase) }

    let(:to_phase_id) { to_phase.id }
    let(:phase_id) { from_phase.id }
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
