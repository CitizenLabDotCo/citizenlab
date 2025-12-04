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

      expect(participation_taking_poll).to match_array([
        {
          item_id: response1.id,
          action: 'taking_poll',
          acted_at: a_kind_of(Time),
          classname: 'Response',
          participant_id: user1.id,
          user_custom_field_values: {}
        },
        {
          item_id: response2.id,
          action: 'taking_poll',
          acted_at: a_kind_of(Time),
          classname: 'Response',
          participant_id: user2.id,
          user_custom_field_values: {}
        }
      ])

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

      expect(participations[:taking_poll].map { |p| p[:item_id] }).to match_array([
        response1.id,
        response2.id
      ])
    end
  end
end
