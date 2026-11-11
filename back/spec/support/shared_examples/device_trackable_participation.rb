# frozen_string_literal: true

# Shared examples for testing the DeviceTrackableParticipation concern.
# Usage: it_behaves_like 'device_trackable_participation'
RSpec.shared_examples 'device_trackable_participation' do |factory_name: nil|
  let(:trackable) do
    factory_name ||= described_class.model_name.singular.to_sym
    instance = build(factory_name)
    instance.project.update!(track_participation_device: true)
    # Nothing is tracked outside a phase.
    unless TimelineService.new.current_phase_not_archived(instance.project)
      create(:phase, project: instance.project, start_at: 1.week.ago, end_at: 1.week.from_now)
      instance.project.phases.reload
    end
    instance
  end

  describe 'participation_device association' do
    it { is_expected.to have_one(:participation_device).dependent(:destroy) }
  end

  describe 'device tracking' do
    it 'creates a ParticipationDevice when tracking is enabled' do
      raise '`trackable` must not be persisted' if trackable.persisted?

      SettingsService.new.activate_feature!('participation_device_tracking')
      Current.remote_ip = '1.2.3.4'
      Current.user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0'

      trackable.save!

      expect(trackable.reload.participation_device).to have_attributes(browser_name: 'Firefox')
    end

    it 'does not prevent creation when tracking fails' do
      allow(ParticipationDeviceService).to receive(:track).and_raise(StandardError.new('test error'))
      allow(ErrorReporter).to receive(:report)

      expect { create(factory_name) }.to change(described_class, :count).by(1)
    end
  end
end
