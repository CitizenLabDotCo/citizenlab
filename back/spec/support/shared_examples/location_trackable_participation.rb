# frozen_string_literal: true

# Shared examples for testing the LocationTrackableParticipation concern.
# Usage: it_behaves_like 'location_trackable_participation'
RSpec.shared_examples 'location_trackable_participation' do |factory_name: nil|
  let(:trackable_factory) { factory_name || described_class.model_name.singular.to_sym }
  let(:trackable) do
    instance = build(trackable_factory)
    instance.project.update!(track_participation_location: true)
    # Only the participant's own request is tracked.
    participant = instance.try(:author) || instance.try(:user)
    participant&.save!
    Current.request_user_id = participant&.id
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

    it 'does not track a participation posted by someone else' do
      SettingsService.new.activate_feature!('participation_location_tracking')
      Current.location_headers = { country_code: 'BE', city: 'Brussels' }
      trackable
      Current.request_user_id = create(:admin).id

      trackable.save!

      expect(trackable.reload.participation_location).to be_nil
    end

    if described_class.column_names.include?('anonymous')
      it 'deletes the ParticipationLocation when the participation is made anonymous' do
        SettingsService.new.activate_feature!('participation_location_tracking')
        Current.location_headers = { country_code: 'BE', city: 'Brussels' }
        trackable.save!
        expect(trackable.reload.participation_location).to be_present

        trackable.update!(anonymous: true)

        expect(trackable.reload.participation_location).to be_nil
        expect(ParticipationLocation.where(trackable: trackable)).to be_empty
      end
    end

    it 'does not prevent creation when tracking fails' do
      allow(ParticipationLocationService).to receive(:track).and_raise(StandardError.new('test error'))
      allow(ErrorReporter).to receive(:report)

      expect { create(trackable_factory) }.to change(described_class, :count).by(1)
    end
  end
end
