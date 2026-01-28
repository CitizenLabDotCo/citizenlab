require 'rails_helper'

RSpec.describe Insights::PollPhaseInsightsService do
  let(:service) { described_class.new(phase) }
  let(:phase) { create(:poll_phase) }

  let(:user1) { create(:user) }
  let!(:response1) { create(:poll_response, phase: phase, user: user1) }

  let(:user2) { create(:user) }
  let!(:response2) { create(:poll_response, phase: phase, user: user2) }

  describe '#participation_taking_poll' do
    it 'returns the participation taking polls data associated with the phase' do
      participation_taking_poll = service.send(:participation_taking_poll)

      expect(participation_taking_poll).to contain_exactly({
        item_id: response1.id,
        action: 'taking_poll',
        acted_at: a_kind_of(Time),
        classname: 'Response',
        participant_id: user1.id,
        user_custom_field_values: {}
      }, {
        item_id: response2.id,
        action: 'taking_poll',
        acted_at: a_kind_of(Time),
        classname: 'Response',
        participant_id: user2.id,
        user_custom_field_values: {}
      })

      first_participation = participation_taking_poll.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Polls::Response.find(first_participation[:item_id]).created_at)
    end
  end

  describe '#phase_participations' do
    it 'returns the expected aggregation of sets of participations' do
      participations = service.send(:phase_participations)

      expect(participations).to eq({
        taking_poll: service.send(:participation_taking_poll)
      })

      expect(participations[:taking_poll].map { |p| p[:item_id] }).to contain_exactly(response1.id, response2.id)
    end
  end

  describe 'phase_participation_method_metrics' do
    let(:user1) { create(:user) }
    let(:participation1) { create(:taking_poll_participation, acted_at: 10.days.ago, user: user1) }
    let(:participation2) { create(:taking_poll_participation, acted_at: 5.days.ago, user: user1) }

    let(:participations) do
      { taking_poll: [participation1, participation2] }
    end

    it 'calculates the correct metrics' do
      metrics = service.send(:phase_participation_method_metrics, participations)

      expect(metrics).to eq({
        responses: 2,
        responses_7_day_percent_change: 0.0 # from 1 (in week before last) to 1 (in last 7 days) = 0% change
      })
    end
  end
end
