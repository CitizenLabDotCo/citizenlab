# frozen_string_literal: true

module DeviceTrackableParticipation
  extend ActiveSupport::Concern

  included do
    has_one :participation_device, as: :trackable, dependent: :destroy, inverse_of: :trackable
    after_create :track_participation_device
    # Where the phase allows it, participants can make an idea or comment
    # anonymous after posting it. The device ID could identify them.
    after_update :forget_participation_device, if: -> { try(:made_anonymous?) }
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

  def forget_participation_device
    participation_device&.destroy!
  end
end
