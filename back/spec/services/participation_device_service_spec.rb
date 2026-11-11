# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationDeviceService do
  describe '.track' do
    let(:project) { create(:project_with_active_ideation_phase, track_participation_device: true) }
    let(:idea) { create(:idea, project: project) }
    let(:iphone) do
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' \
        '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    end

    before { SettingsService.new.activate_feature!('participation_device_tracking') }

    it 'records the device hash and the browser details, without location tracking' do
      expect(ParticipationLocationService.enabled_for?(project)).to be false
      expect { described_class.track(idea, '1.2.3.4', iphone) }.to change(ParticipationDevice, :count).by(1)

      expect(idea.reload.participation_device).to have_attributes(
        device_hash: ParticipationDevice.hash_device(project.id, '1.2.3.4', iphone),
        device_type: 'mobile',
        browser_name: 'Safari',
        os_name: 'iOS (iPhone)'
      )
    end

    it 'does nothing for an anonymous post' do
      comment = create(:comment, idea: idea, anonymous: true)

      expect { described_class.track(comment, '1.2.3.4', iphone) }.not_to change(ParticipationDevice, :count)
    end

    it 'does nothing without an IP' do
      expect { described_class.track(idea, nil, iphone) }.not_to change(ParticipationDevice, :count)
    end

    it 'does nothing when the feature is off' do
      SettingsService.new.deactivate_feature!('participation_device_tracking')

      expect { described_class.track(idea, '1.2.3.4', iphone) }.not_to change(ParticipationDevice, :count)
    end

    it 'does nothing when the project does not track devices' do
      project.update!(track_participation_device: false)

      expect { described_class.track(idea, '1.2.3.4', iphone) }.not_to change(ParticipationDevice, :count)
    end
  end
end
