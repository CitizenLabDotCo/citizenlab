require 'rails_helper'

RSpec.describe Insights::BasePhaseInsightsService do
  let(:service) { described_class.new }

  it 'instantiates IdeationPhaseInsightsService for ideation participation method' do
    phase = build(:ideation_phase)
    expect(Insights::IdeationPhaseInsightsService).to receive(:new).with(phase).and_call_original
    described_class.call(phase)
  end

  it 'raises ArgumentError for unhandled participation method' do
    phase = build(:information_phase)
    expect do
      described_class.call(phase)
    end.to raise_error(ArgumentError, 'Unhandled phase participation_method: information')
  end
end
