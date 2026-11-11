# frozen_string_literal: true

# The rules that location and device tracking share (see
# ParticipationLocationService and ParticipationDeviceService). Each also
# needs its own feature and project setting to be on.
class ParticipationTrackingService
  class << self
    # Called after every save of the participation, and only true on the save
    # that submits it.
    def track?(trackable)
      just_submitted?(trackable) &&
        !trackable.try(:anonymous?) &&
        !anonymous_participation_allowed?(phase_of(trackable))
    end

    private

    # Ideas and baskets can exist before they are submitted (a survey draft,
    # votes still being picked). Waiting for the submission means the request
    # we read is the one that submits it, and that a survey response that is
    # made anonymous on submission is never tracked.
    def just_submitted?(trackable)
      case trackable
      when Idea then trackable.just_submitted?
      when Basket then trackable.saved_change_to_submitted_at?(from: nil)
      else trackable.previously_new_record?
      end
    end

    # Where the admin lets participants post anonymously, we don't record
    # anything that could identify them, for anonymous and named posts alike.
    # Fails closed when the phase can't be found.
    def anonymous_participation_allowed?(phase)
      return true unless phase

      phase.allow_anonymous_participation || phase.pmethod.user_data_collection != 'all_data'
    end

    def phase_of(trackable)
      trackable.try(:creation_phase) ||
        trackable.try(:phase) ||
        TimelineService.new.current_phase_not_archived(trackable.project)
    end
  end
end
