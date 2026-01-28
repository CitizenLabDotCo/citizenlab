# frozen_string_literal: true

module LocationTrackableParticipation
  extend ActiveSupport::Concern

  included do
    has_one :participation_location, as: :trackable, dependent: :destroy, inverse_of: :trackable
    after_create :track_participation_location
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
