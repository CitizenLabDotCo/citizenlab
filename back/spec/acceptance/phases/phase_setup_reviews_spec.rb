# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase setup reviews' do
  before { header 'Content-Type', 'application/json' }

  let(:phase) { create(:phase) }
  let(:id) { phase.id }

  get 'web_api/v1/phases/:id' do
    example 'Review progress is not exposed to visitors' do
      phase.update!(reviewed_setup_cards: ['input_term'])
      do_request
      assert_status 200
      expect(response_data[:attributes]).not_to have_key(:reviewed_setup_cards)
    end
  end

  post 'web_api/v1/phases/:id/review_setup_card' do
    parameter :card, 'The setup card reviewed by a project manager', required: true
    let(:card) { 'input_term' }

    context 'as an admin' do
      before { admin_header_token }

      example 'Share reviews between admins without replacing existing reviews' do
        phase.update!(reviewed_setup_cards: ['sorting'])
        do_request
        assert_status 200
        expect(phase.reload.reviewed_setup_cards).to match_array(%w[sorting input_term])

        admin_header_token
        do_request(card: 'views')
        assert_status 200
        expect(phase.reload.reviewed_setup_cards).to match_array(%w[sorting input_term views])
        expect(response_data[:attributes][:reviewed_setup_cards]).to match_array(%w[sorting input_term views])
      end

      example 'Repeated reviews are idempotent and leave phase settings unchanged' do
        phase.update!(reviewed_setup_cards: ['input_term'])
        title = phase.title_multiloc
        do_request(card: 'input_term', phase: { title_multiloc: { en: 'Do not save this' } })
        assert_status 200
        expect(phase.reload.reviewed_setup_cards).to eq ['input_term']
        expect(phase.title_multiloc).to eq title
      end

      example 'Reject unknown cards' do
        do_request(card: 'unknown')
        assert_status 422
        expect(phase.reload.reviewed_setup_cards).to be_empty
      end
    end

    context 'as a project manager' do
      before { header_token_for(create(:project_moderator, projects: [phase.project])) }

      example_request 'Managers can review their project' do
        assert_status 200
        expect(phase.reload.reviewed_setup_cards).to eq ['input_term']
      end
    end

    context 'as a manager of another project' do
      before { header_token_for(create(:project_moderator)) }

      example_request 'Managers cannot review another project' do
        assert_status 401
        expect(phase.reload.reviewed_setup_cards).to be_empty
      end
    end

    context 'as a resident' do
      before { resident_header_token }

      example_request 'Residents cannot review phase setup' do
        assert_status 401
        expect(phase.reload.reviewed_setup_cards).to be_empty
      end
    end

    context 'without signing in' do
      example_request 'Visitors cannot review phase setup' do
        assert_status 401
        expect(phase.reload.reviewed_setup_cards).to be_empty
      end
    end
  end
end
