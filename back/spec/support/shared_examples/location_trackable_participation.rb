# frozen_string_literal: true

# Shared examples for testing the LocationTrackableParticipation concern.
# Usage: it_behaves_like 'location_trackable_participation'
RSpec.shared_examples 'location_trackable_participation' do |factory_name: nil|
  let(:trackable) do
    factory_name ||= described_class.model_name.singular.to_sym
    instance = build(factory_name)
    instance.project.update!(track_participation_location: true)
    # Nothing is tracked outside a phase.
    unless TimelineService.new.current_phase_not_archived(instance.project)
      create(:phase, project: instance.project, start_at: 1.week.ago, end_at: 1.week.from_now)
      instance.project.phases.reload
    end
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

      expect { create(factory_name) }.to change(described_class, :count).by(1)
    end
  end
end
