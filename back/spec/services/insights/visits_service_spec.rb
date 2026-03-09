require 'rails_helper'

describe Insights::VisitsService do
  before do
    AppConfiguration.instance.update!(platform_start_at: '2025-09-01')
    travel_to(Time.zone.parse('2025-12-12'))
  end

  context 'Phase visits' do
    # rubocop:disable RSpec/ScatteredLet
    let(:phase) { create(:single_voting_phase, start_at: 20.days.ago, end_at: 2.days.ago) }

    (1..4).each do |i|
      let!(:"user#{i}") { create(:user) }
    end

    let!(:session1) { create(:session, user_id: user1.id) }
    let!(:pageview1) { create(:pageview, session: session1, created_at: 22.days.ago, project_id: phase.project.id) } # before phase start
    let!(:pageview2) { create(:pageview, session: session1, created_at: 13.days.ago, project_id: phase.project.id) } # in phase
    let!(:pageview3) { create(:pageview, session: session1, created_at: 13.days.ago, project_id: phase.project.id) } # in phase, and repeat visitor

    let!(:session2) { create(:session, user_id: user2.id, monthly_user_hash: 'user2_user_hash') }
    let!(:pageview4) { create(:pageview, session: session2, created_at: 5.days.ago, project_id: phase.project.id) } # in phase & last 7 days
    let!(:pageview5) { create(:pageview, session: session2, created_at: 4.days.ago, project_id: phase.project.id) } # in last 7 days, and repeat visitor

    let!(:session3) { create(:session, user_id: nil, monthly_user_hash: 'anonymous_user_hash') }
    let!(:pageview6) { create(:pageview, session: session3, created_at: 13.days.ago, project_id: phase.project.id) } # in phase

    let!(:session4) { create(:session, user_id: user3.id) }
    let!(:pageview7) { create(:pageview, session: session4, created_at: 22.days.ago, project_id: phase.project.id) } # before phase start

    let!(:session5) { create(:session, user_id: user4.id) }
    let!(:pageview8) { create(:pageview, session: session5, created_at: 1.day.ago, project_id: phase.project.id) } # after phase end
    # rubocop:enable RSpec/ScatteredLet

    it 'returns correct visits data for the phase' do
      service = described_class.new(phase.project_id, start_at: phase.start_at, end_at: phase.end_at)
      expect(service.total_visits).to eq({ visits: 3, visitors: 3 })
      expect(service.visits_by_date('month')).to eq [
        { visits: 2, visitors: 2, date_group: Date.new(2025, 11) },
        { visits: 1, visitors: 1, date_group: Date.new(2025, 12) }
      ]
    end

    describe 'edge cases for phase date boundaries' do
      let(:phase2) { create(:single_voting_phase, start_at: '2025-10-15', end_at: '2025-11-02') }
      let(:session) { create(:session, user_id: user1.id) }
      let(:service) { described_class.new(phase2.project_id, start_at: phase2.start_at, end_at: phase2.end_at) }

      it 'excludes a visit before the phase start date' do
        create(:pageview, session:, created_at: '2025-10-14 23:59:59', project_id: phase2.project.id) # before phase start
        expect(service.total_visits).to eq({ visits: 0, visitors: 0 })
        expect(service.visits_by_date('month')).to eq []
      end

      it 'includes a visit on the phase start date' do
        create(:pageview, session:, created_at: '2025-10-15 00:00:00', project_id: phase2.project.id) # on phase start
        expect(service.total_visits).to eq({ visits: 1, visitors: 1 })
        expect(service.visits_by_date('month')).to eq [
          { visits: 1, visitors: 1, date_group: Date.new(2025, 10) }
        ]
      end

      it 'includes a visit on the phase end date' do
        create(:pageview, session:, created_at: '2025-11-02 23:59:59', project_id: phase2.project.id) # on phase end
        expect(service.total_visits).to eq({ visits: 1, visitors: 1 })
        expect(service.visits_by_date('month')).to eq [
          { visits: 1, visitors: 1, date_group: Date.new(2025, 11) }
        ]
      end

      it 'excludes a visit after the phase end date' do
        create(:pageview, session:, created_at: '2025-11-03 00:00:00', project_id: phase2.project.id) # after phase end
        expect(service.total_visits).to eq({ visits: 0, visitors: 0 })
        expect(service.visits_by_date('month')).to eq []
      end
    end
  end
end
