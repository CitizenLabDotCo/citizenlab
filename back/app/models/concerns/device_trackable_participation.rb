# frozen_string_literal: true

module DeviceTrackableParticipation
  extend ActiveSupport::Concern

  included do
    has_one :participation_device, as: :trackable, dependent: :destroy, inverse_of: :trackable
    after_save :track_participation_device
  end

  # The value of one ParticipationDevice::EXPORT_COLUMNS attribute for
  # exports. Blank when the participant chose to post anonymously, like the
  # location.
  def participation_device_for_export(attribute)
    return if try(:anonymous?)

    participation_device&.public_send(attribute)
  end

  private

  def track_participation_device
    ParticipationDeviceService.track(self, Current.remote_ip, Current.user_agent)
  rescue StandardError => e
    # A tracking error should not prevent the creation of the participation.
    Rails.logger.error("Failed to track participation device: #{e.message}")
    ErrorReporter.report(e)
  end
end
