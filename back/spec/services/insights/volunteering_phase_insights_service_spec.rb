require 'rails_helper'

RSpec.describe Insights::VolunteeringPhaseInsightsService do
  let(:service) { described_class.new(phase) }
  let(:phase) { create(:volunteering_phase) }

  let(:cause1) { create(:cause, phase: phase) }
  let(:cause2) { create(:cause, phase: phase) }

  let(:user1) { create(:user) }
  let!(:volunteering1) { create(:volunteer, cause: cause1, user: user1) }
  let!(:volunteering2) { create(:volunteer, cause: cause2, user: user1) }

  let(:user2) { create(:user) }
  let!(:volunteering3) { create(:volunteer, cause: cause1, user: user2) }

  describe '#participations_volunteering' do
    it 'returns the participation volunteerings data associated with the phase' do
      participations_volunteering = service.send(:participations_volunteering)

      expect(participations_volunteering).to contain_exactly({
        item_id: volunteering1.id,
        action: 'volunteering',
        acted_at: volunteering1.created_at,
        classname: 'Volunteer',
        participant_id: user1.id,
        user_custom_field_values: {}
      }, {
        item_id: volunteering2.id,
        action: 'volunteering',
        acted_at: volunteering2.created_at,
        classname: 'Volunteer',
        participant_id: user1.id,
        user_custom_field_values: {}
      }, {
        item_id: volunteering3.id,
        action: 'volunteering',
        acted_at: volunteering3.created_at,
        classname: 'Volunteer',
        participant_id: user2.id,
        user_custom_field_values: {}
      })

      first_participation = participations_volunteering.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Volunteering::Volunteer.find(first_participation[:item_id]).created_at)
    end
  end

  describe '#phase_participations' do
    it 'returns the expected aggregation of sets of participations' do
      participations = service.send(:phase_participations)

      expect(participations).to eq({
        volunteering: service.send(:participations_volunteering)
      })

      expect(participations[:volunteering].map { |p| p[:item_id] }).to contain_exactly(volunteering1.id, volunteering2.id, volunteering3.id)
    end
  end

  describe 'phase_participation_method_metrics' do
    let(:user1) { create(:user) }
    let(:participation1) { create(:volunteering_participation, acted_at: 10.days.ago, user: user1) }
    let(:participation2) { create(:volunteering_participation, acted_at: 5.days.ago, user: user1) }

    let(:participations) do
      { volunteering: [participation1, participation2] }
    end

    it 'calculates the correct metrics' do
      metrics = service.send(:phase_participation_method_metrics, participations)

      expect(metrics).to eq({
        volunteerings: 2,
        volunteerings_7_day_percent_change: 0.0 # from 1 (in week before last) to 1 (in last 7 days) = 0% change
      })
    end
  end
end
