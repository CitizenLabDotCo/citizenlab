require 'rails_helper'

describe Insights::VisitsService do
  let(:service) { described_class.new }

  describe '#phase_visitors_data' do
    # rubocop:disable RSpec/ScatteredLet
    let(:phase) { create(:single_voting_phase, start_at: 20.days.ago, end_at: 2.days.ago) }

    (1..4).each do |i|
      let!(:"user#{i}") { create(:user) }
    end

    let!(:session1) { create(:session, user_id: user1.id) }
    let!(:pageview1) { create(:pageview, session: session1, created_at: 22.days.ago, project_id: phase.project.id) } # before phase start
    let!(:pageview2) { create(:pageview, session: session1, created_at: 13.days.ago, project_id: phase.project.id) } # in phase
    let!(:pageview3) { create(:pageview, session: session1, created_at: 13.days.ago, project_id: phase.project.id) } # in phase, but repeat visitor

    let!(:session2) { create(:session, user_id: user2.id, monthly_user_hash: 'user2_user_hash') }
    let!(:pageview4) { create(:pageview, session: session2, created_at: 5.days.ago, project_id: phase.project.id) } # in phase & last 7 days
    let!(:pageview5) { create(:pageview, session: session2, created_at: 4.days.ago, project_id: phase.project.id) } # in last 7 days, but repeat visitor

    let!(:session3) { create(:session, user_id: nil, monthly_user_hash: 'anonymous_user_hash') }
    let!(:pageview6) { create(:pageview, session: session3, created_at: 13.days.ago, project_id: phase.project.id) } # in phase

    let!(:session4) { create(:session, user_id: user3.id) }
    let!(:pageview7) { create(:pageview, session: session4, created_at: 22.days.ago, project_id: phase.project.id) } # before phase start

    let!(:session5) { create(:session, user_id: user4.id) }
    let!(:pageview8) { create(:pageview, session: session5, created_at: 1.day.ago, project_id: phase.project.id) } # after phase end
    # rubocop:enable RSpec/ScatteredLet

    it 'returns correct visits data for the phase' do
      visits_data = service.phase_visits_data(phase)

      expect(visits_data[:visitors_total]).to eq(3)
      expect(visits_data[:visitors_last_7_days]).to eq(1)
      expect(visits_data[:visits]).to match_array([
        { date: pageview2.created_at, visitor_id: user1.id.to_s },
        { date: pageview3.created_at, visitor_id: user1.id.to_s },
        { date: pageview4.created_at, visitor_id: user2.id.to_s },
        { date: pageview5.created_at, visitor_id: user2.id.to_s },
        { date: pageview6.created_at, visitor_id: 'anonymous_user_hash' }
      ])
    end
  end
end
