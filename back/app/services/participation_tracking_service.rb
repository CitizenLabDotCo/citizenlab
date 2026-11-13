# frozen_string_literal: true

# When a participation may be tracked (see ParticipationLocationService).
# Tracking also needs its own feature and project setting to be on.
class ParticipationTrackingService
  class << self
    def track?(trackable)
      posted_by_participant?(trackable) && !trackable.try(:anonymous?) && !anonymous_survey?(trackable)
    end

    private

    # The request is only the participant's own when they post themselves: not
    # when a moderator posts on someone's behalf (e.g. typing up paper
    # submissions) or a tool such as the MCP server creates it.
    def posted_by_participant?(trackable)
      Current.activity_channel.nil? && participant_id(trackable) == Current.request_user_id
    end

    def participant_id(trackable)
      trackable.respond_to?(:author_id) ? trackable.author_id : trackable.user_id
    end

    # Surveys that don't collect all user data make every response anonymous
    # when it is submitted, after the draft was created.
    def anonymous_survey?(trackable)
      phase = trackable.try(:creation_phase) || trackable.try(:phase)
      phase.present? && !phase.pmethod.identifies_author?
    end
  end
end
