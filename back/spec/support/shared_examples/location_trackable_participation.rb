# frozen_string_literal: true

# Shared examples for testing the LocationTrackableParticipation concern.
# Usage: it_behaves_like 'location_trackable_participation'
RSpec.shared_examples 'location_trackable_participation' do |factory_name: nil|
  let(:trackable) do
    factory_name ||= described_class.model_name.singular.to_sym
    instance = build(factory_name)
    instance.project.update!(track_participation_location: true)
    instance
  end

  describe 'participation_location association' do
    it { is_expected.to have_one(:participation_location).dependent(:destroy) }
  end

  describe 'location tracking' do
    it 'creates a ParticipationLocation when tracking is enabled' do
      raise '`trackable` must not be persisted' if trackable.persisted?

      SettingsService.new.activate_feature!('participation_location_tracking')
      Current.location_headers = { country_code: 'BE', city: 'Brussels' }

      trackable.save!

      expect(trackable.reload.participation_location).to have_attributes(
        country_code: 'BE',
        city: 'Brussels'
      )
    end

    it 'does not prevent creation when tracking fails' do
      allow(ParticipationLocationService).to receive(:track).and_raise(StandardError.new('test error'))
      allow(ErrorReporter).to receive(:report)

      expect { create(factory_name) }.to change(described_class, :count).by(1)
    end
  end
end
