# frozen_string_literal: true

module LocationTrackableParticipation
  extend ActiveSupport::Concern

  included do
    has_one :participation_location, as: :trackable, dependent: :destroy, inverse_of: :trackable
    after_create :track_participation_location
    # Where the phase allows it, participants can make an idea or comment
    # anonymous after posting it. The location could identify them.
    after_update :forget_participation_location, if: -> { try(:made_anonymous?) }
  end

  private

  def track_participation_location
    ParticipationLocationService.track(self, Current.location_headers)
  rescue StandardError => e
    # A tracking error should not prevent the creation of the participation.
    Rails.logger.error("Failed to track participation location: #{e.message}")
    ErrorReporter.report(e)
  end

  def forget_participation_location
    participation_location&.destroy!
  end
end
