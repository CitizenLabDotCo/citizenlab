# frozen_string_literal: true

module LocationTrackableParticipation
  extend ActiveSupport::Concern

  included do
    has_one :participation_location, as: :trackable, dependent: :destroy, inverse_of: :trackable
    after_create :track_participation_location
  end

  # The value of one ParticipationLocation::EXPORT_COLUMNS attribute for
  # exports. Blank when the participant chose to post anonymously, since the
  # location could identify them.
  def participation_location_for_export(attribute)
    return if try(:anonymous?)

    participation_location&.export_value(attribute)
  end

  private

  def track_participation_location
    ParticipationLocationService.track(self, Current.location_headers)
  rescue StandardError => e
    # A tracking error should not prevent the creation of the participation.
    Rails.logger.error("Failed to track participation location: #{e.message}")
    ErrorReporter.report(e)
  end
end
