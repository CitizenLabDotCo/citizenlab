# frozen_string_literal: true

# Shared examples for testing the DeviceTrackableParticipation concern.
# Usage: it_behaves_like 'device_trackable_participation'
RSpec.shared_examples 'device_trackable_participation' do |factory_name: nil|
  let(:trackable_factory) { factory_name || described_class.model_name.singular.to_sym }
  let(:trackable) do
    instance = build(trackable_factory)
    instance.project.update!(track_participation_device: true)
    # Only the participant's own request is tracked.
    participant = instance.try(:author) || instance.try(:user)
    participant&.save!
    Current.request_user_id = participant&.id
    instance
  end

  def use_browser
    Current.remote_ip = '1.2.3.4'
    Current.user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'
  end

  describe 'participation_device association' do
    it { is_expected.to have_one(:participation_device).dependent(:destroy) }
  end

  describe 'device tracking' do
    it 'creates a ParticipationDevice when tracking is enabled' do
      raise '`trackable` must not be persisted' if trackable.persisted?

      SettingsService.new.activate_feature!('participation_device_tracking')
      use_browser

      trackable.save!

      expect(trackable.reload.participation_device).to have_attributes(browser_name: 'Firefox')
    end

    it 'does not track a participation posted by someone else' do
      SettingsService.new.activate_feature!('participation_device_tracking')
      use_browser
      trackable
      Current.request_user_id = create(:admin).id

      trackable.save!

      expect(trackable.reload.participation_device).to be_nil
    end

    if described_class.column_names.include?('anonymous')
      it 'deletes the ParticipationDevice when the participation is made anonymous' do
        SettingsService.new.activate_feature!('participation_device_tracking')
        use_browser
        trackable.save!
        expect(trackable.reload.participation_device).to be_present

        trackable.update!(anonymous: true)

        expect(trackable.reload.participation_device).to be_nil
        expect(ParticipationDevice.where(trackable: trackable)).to be_empty
      end
    end

    it 'does not prevent creation when tracking fails' do
      allow(ParticipationDeviceService).to receive(:track).and_raise(StandardError.new('test error'))
      allow(ErrorReporter).to receive(:report)

      expect { create(trackable_factory) }.to change(described_class, :count).by(1)
    end
  end
end
