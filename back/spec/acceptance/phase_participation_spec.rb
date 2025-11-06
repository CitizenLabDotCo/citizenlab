require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase participation' do
  before { admin_header_token }

  get 'web_api/v1/phases/:id/participation' do
    context 'voting phase' do
      # rubocop:disable RSpec/ScatteredLet
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

      let!(:comment1) { create(:comment, idea: idea1, author: user1, created_at: 25.days.ago) } # before voting phase (not counted)
      let!(:comment2) { create(:comment, idea: idea2, author: user2, created_at: 13.days.ago) } # in voting phase
      let!(:comment3) { create(:comment, idea: idea3, author: user2, created_at: 5.days.ago) } # in voting phase & last 7 days
      let!(:comment4) { create(:comment, idea: idea3, author: user3, created_at: 5.days.ago) } # in voting phase & last 7 days

      let!(:basket1) { create(:basket, phase: voting_phase, user: user4, submitted_at: 20.days.ago) } # before voting phase (still counts)
      let!(:basket2) { create(:basket, phase: voting_phase, user: user5, submitted_at: 10.days.ago) } # in voting phase
      let!(:basket3) { create(:basket, phase: voting_phase, user: user5, submitted_at: 5.days.ago) } # in voting phase & last 7 days
      let!(:basket4) { create(:basket, phase: voting_phase, user: user6, submitted_at: 5.days.ago) } # in voting phase & last 7 days
      let!(:basket5) { create(:basket, phase: voting_phase, user: user3, submitted_at: 5.days.ago) } # in voting phase & last 7 days
      # rubocop:enable RSpec/ScatteredLet

      example_request 'Get a phase with participation data' do
        assert_status 200

        participations = json_response_body.dig(:data, :attributes, :participation)
        expect(participations).to eq({
          participations: {
            count: 8,
            change_last_7_days: 5
          },
          participants: {
            count: 5, # unique users: user2, user3, user4, user5, user6
            change_last_7_days: 2, # NEW unique users in last 7 days: user3, user6
            demographics: [{ tbc: 'tbc' }]
          },
          actions: [
            {
              action_type: 'voting',
              participations: {
                count: 5,
                change_last_7_days: 3
              },
              participants: {
                count: 4, # unique users: user3, user4, user5, user6
                change_last_7_days: 2, # NEW unique users in last 7 days: user3, user6
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
                count: 2, # unique users: user2, user3
                change_last_7_days: 1, # NEW unique user in last 7 days: user3
                demographics: [{ tbc: 'tbc' }]
              }
            }
          ]
        })
      end
    end
  end
end
