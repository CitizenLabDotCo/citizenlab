# frozen_string_literal: true

# When a participation may be tracked (see ParticipationLocationService).
# Tracking also needs its own feature and project setting to be on.
class ParticipationTrackingService
  class << self
    def track?(trackable)
      !trackable.try(:anonymous?) && !anonymous_survey?(phase_of(trackable))
    end

    private

    # Surveys that don't collect all user data make every response anonymous
    # when it is submitted, after the draft was created. Fails closed when the
    # phase can't be found.
    def anonymous_survey?(phase)
      return true unless phase

      phase.pmethod.user_data_collection != 'all_data'
    end

    def phase_of(trackable)
      trackable.try(:creation_phase) ||
        trackable.try(:phase) ||
        TimelineService.new.current_phase_not_archived(trackable.project)
    end
  end
end
