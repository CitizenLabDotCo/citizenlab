require 'rails_helper'

RSpec.describe Insights::DocumentAnnotationPhaseInsightsService do
  let(:service) { described_class.new(phase) }
  let(:phase) { create(:document_annotation_phase, start_at: 20.days.ago, end_at: 3.days.ago) }

  before do
    # Visit queries are clamped to the platform's lifetime, so it has to predate the phase
    AppConfiguration.instance.update!(platform_start_at: 60.days.ago)
  end

  describe '#phase_participations' do
    it 'reports no participations, as annotations are kept by Konveio' do
      expect(service.send(:phase_participations)).to eq({})
    end
  end

  describe '#phase_participation_method_metrics' do
    it 'has no method specific metrics' do
      expect(service.send(:phase_participation_method_metrics, {})).to eq({})
    end
  end

  describe '#call' do
    it 'returns the visit based metrics without raising' do
      metrics = service.call[:metrics]

      expect(metrics).to include(
        visitors: 0,
        participants: 0,
        participation_rate_as_percent: 'participant_count_compared_with_zero_visitors',
        'document_annotation' => {}
      )
    end

    it 'counts visitors while participants stay out of reach' do
      user = create(:user)
      session = create(:session, user_id: user.id)
      create(:pageview, session: session, project_id: phase.project_id, created_at: 12.days.ago)

      metrics = service.call[:metrics]

      expect(metrics[:visitors]).to eq 1
      expect(metrics[:participants]).to eq 0
      expect(metrics[:participation_rate_as_percent]).to eq 0.0
    end
  end
end
