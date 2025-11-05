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

    context 'voting phase 2' do
      let(:ideation_phase) do
        create(
          :phase,
          participation_method: 'ideation',
          start_at: 30.days.ago,
          end_at: 15.days.ago
        )
      end

      let(:voting_phase) do
        create(
          :phase,
          participation_method: 'voting',
          voting_method: 'single_voting',
          start_at: 14.days.ago,
          end_at: 1.day.ago,
          project: ideation_phase.project
        )
      end

      let(:id) { voting_phase.id }

      (1..3).each do |i|
        let!(:"idea#{i}") { create(:idea, phases: [ideation_phase, voting_phase], project: ideation_phase.project, submitted_at: 20.days.ago) }
      end

      (1..6).each do |i|
        let!(:"user#{i}") { create(:user) }
      end

      let!(:comment1) { create(:comment, idea: idea1, author: user1, created_at: 25.days.ago, ) } # before voting phase
      let!(:comment2) { create(:comment, idea: idea2, author: user2, created_at: 13.days.ago) } # in voting phase
      let!(:comment3) { create(:comment, idea: idea3, author: user2, created_at: 5.days.ago) } # in voting phase & last 7 days
      let!(:comment4) { create(:comment, idea: idea3, author: user3, created_at: 5.days.ago) } # in voting phase & last 7 days

      example_request 'Get a phase with participation data' do
        assert_status 200

        participations = json_response_body.dig(:data, :attributes, :participation)
        expect(participations).to eq({
          participations: {
            count: 3,
            change_last_7_days: 2
          },
          participants: {
            count: 2,
            change_last_7_days: 1,
            demographics: [{ tbc: "tbc" }]
          },
          actions: [
            {
              action_type: 'voting',
              participations: {
                count: 0,
                change_last_7_days: 0
              },
              participants: {
                count: 0,
                change_last_7_days: 0,
                demographics: [{ tbc: 'tbc' }]
              }
            },
            {
              action_type: 'commenting_idea',
              participations: {
                count: 3,
                change_last_7_days: 2
              },
              participants: {
                count: 2,
                change_last_7_days: 1,
                demographics: [{ tbc: 'tbc' }]
              }
            }
          ]
        })
      end
    end
  end
end
