# frozen_string_literal: true

class ParticipationDeviceService
  class << self
    def track(trackable, remote_ip, user_agent)
      return if remote_ip.blank?
      return unless enabled_for?(trackable.project) && ParticipationTrackingService.track?(trackable)
      return if trackable.participation_device

      browser = Browser.new(user_agent.to_s)
      trackable.create_participation_device!(
        device_hash: ParticipationDevice.hash_device(trackable.project.id, remote_ip, user_agent),
        device_type: device_type(browser),
        browser_name: browser.name,
        os_name: browser.platform.name
      )
    end

    def enabled_for?(project)
      AppConfiguration.instance.feature_activated?('participation_device_tracking') &&
        !!project&.track_participation_device
    end

    private

    # Same categories as impact tracking sessions.
    def device_type(browser)
      return 'mobile' if browser.device.mobile?
      return 'tablet' if browser.device.tablet?

      'desktop_or_other'
    end
  end
end
