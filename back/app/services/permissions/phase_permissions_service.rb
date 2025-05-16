module Permissions
  class PhasePermissionsService < BasePermissionsService
    PHASE_DENIED_REASONS = {
      project_inactive: 'project_inactive'
    }.freeze

    POSTING_DENIED_REASONS = {
      posting_not_supported: 'posting_not_supported',
      posting_disabled: 'posting_disabled',
      posting_limited_max_reached: 'posting_limited_max_reached'
    }.freeze

    COMMENTING_DENIED_REASONS = {
      commenting_not_supported: 'commenting_not_supported',
      commenting_disabled: 'commenting_disabled'
    }.freeze

    REACTING_DENIED_REASONS = {
      reacting_not_supported: 'reacting_not_supported',
      reacting_disabled: 'reacting_disabled',
      reacting_dislike_disabled: 'reacting_dislike_disabled',
      reacting_like_limited_max_reached: 'reacting_like_limited_max_reached',
      reacting_dislike_limited_max_reached: 'reacting_dislike_limited_max_reached'
    }.freeze

    VOTING_DENIED_REASONS = {
      not_voting: 'not_voting'
    }.freeze

    ANNOTATING_DOCUMENT_DENIED_REASONS = {
      not_document_annotation: 'not_document_annotation'
    }.freeze

    TAKING_SURVEY_DENIED_REASONS = {
      not_survey: 'not_survey'
    }.freeze

    TAKING_POLL_DENIED_REASONS = {
      not_poll: 'not_poll',
      already_responded: 'already_responded'
    }.freeze

    VOLUNTEERING_DENIED_REASONS = {
      not_volunteering: 'not_volunteering'
    }.freeze

    ATTENDING_EVENT_DENIED_REASONS = {
      attending_event_not_supported: 'attending_event_not_supported'
    }.freeze

    # Actions not to block if the project is inactive - ie no current phase
    IGNORED_PHASE_ACTIONS = %w[attending_event].freeze

    def initialize(phase, user, user_requirements_service: nil, request: nil)
      super(user, user_requirements_service: user_requirements_service)
      @request = request
      @phase ||= phase
    end

    def denied_reason_for_action(action, reaction_mode: nil, delete_action: false)
      return PHASE_DENIED_REASONS[:project_inactive] unless phase || IGNORED_PHASE_ACTIONS.include?(action)

      phase_denied_reason = case action
      when 'posting_idea'
        posting_idea_denied_reason_for_action
      when 'editing_idea'
        editing_idea_denied_reason_for_action
      when 'commenting_idea'
        commenting_idea_denied_reason_for_action
      when 'reacting_idea'
        reacting_denied_reason_for_action(reaction_mode: reaction_mode, delete_action: delete_action)
      when 'voting'
        voting_denied_reason_for_action
      when 'annotating_document'
        annotating_document_denied_reason_for_action
      when 'taking_survey'
        taking_survey_denied_reason_for_action
      when 'taking_poll'
        taking_poll_denied_reason_for_action
      when 'volunteering'
        volunteering_denied_reason_for_action
      when 'attending_event'
        attending_event_denied_reason_for_action
      else
        raise "Unsupported action: #{action}" unless supported_action? action
      end
      return phase_denied_reason if phase_denied_reason

      super(action, scope: phase)
    end

    private

    attr_reader :phase, :request

    # Phase methods
    def posting_idea_denied_reason_for_action
      if !participation_method.supports_submission?
        POSTING_DENIED_REASONS[:posting_not_supported]
      elsif !phase.submission_enabled
        POSTING_DENIED_REASONS[:posting_disabled]
      elsif posting_limit_reached?
        POSTING_DENIED_REASONS[:posting_limited_max_reached]
      end
    end

    def editing_idea_denied_reason_for_action
      unless participation_method.supports_submission?
        POSTING_DENIED_REASONS[:posting_not_supported]
      end
    end

    def commenting_idea_denied_reason_for_action
      if !participation_method.supports_commenting?
        COMMENTING_DENIED_REASONS[:commenting_not_supported]
      elsif !phase.commenting_enabled
        COMMENTING_DENIED_REASONS[:commenting_disabled]
      end
    end

    # NOTE: some reasons should not be returned if trying to delete a reaction (delete_action: true)
    def reacting_denied_reason_for_action(reaction_mode: nil, delete_action: false)
      if !participation_method.supports_reacting?
        REACTING_DENIED_REASONS[:reacting_not_supported]
      elsif !phase.reacting_enabled
        REACTING_DENIED_REASONS[:reacting_disabled]
      elsif reaction_mode == 'down' && !phase.reacting_dislike_enabled
        REACTING_DENIED_REASONS[:reacting_dislike_disabled]
      elsif reaction_mode == 'up' && user && liking_limit_reached? && !delete_action
        REACTING_DENIED_REASONS[:reacting_like_limited_max_reached]
      elsif reaction_mode == 'down' && user && disliking_limit_reached? && !delete_action
        REACTING_DENIED_REASONS[:reacting_dislike_limited_max_reached]
      end
    end

    def taking_survey_denied_reason_for_action
      unless phase.survey?
        TAKING_SURVEY_DENIED_REASONS[:not_survey]
      end
    end

    def annotating_document_denied_reason_for_action
      unless phase.document_annotation?
        ANNOTATING_DOCUMENT_DENIED_REASONS[:not_document_annotation]
      end
    end

    def taking_poll_denied_reason_for_action
      if !phase.poll?
        TAKING_POLL_DENIED_REASONS[:not_poll]
      elsif user && phase.poll_responses.exists?(user: user)
        TAKING_POLL_DENIED_REASONS[:already_responded]
      end
    end

    def voting_denied_reason_for_action
      unless phase.voting?
        VOTING_DENIED_REASONS[:not_voting]
      end
    end

    def volunteering_denied_reason_for_action
      unless phase.volunteering?
        VOLUNTEERING_DENIED_REASONS[:not_volunteering]
      end
    end

    def attending_event_denied_reason_for_action
      if phase && !participation_method.supports_event_attendance?
        ATTENDING_EVENT_DENIED_REASONS[:attending_event_not_supported]
      end
    end

    # Helper methods

    def posting_limit_reached?
      allow_posting_again_after = phase.pmethod.allow_posting_again_after || 10.years
      return false if allow_posting_again_after == 0.seconds

      if user
        return true if phase.ideas.published_after(allow_posting_again_after.ago).exists?(author: user)

        if phase.allow_anonymous_participation?
          author_hash = Idea.create_author_hash(user.id, phase.project.id, true)
          return true if phase.ideas.published_after(allow_posting_again_after.ago).exists?(author_hash: author_hash)
        end
      elsif request # NOTE: Only present if method.supports_everyone_tracking? is true
        tracking_service = Permissions::EveryoneTrackingService.new(user, phase, request)

        # No consent, so only empty cookie present
        return true if tracking_service.submitted_without_tracking_consent?

        # Check cookies for author_hashes for the 'everyone' permission
        author_hashes = tracking_service.author_hashes_from_request

        return true if author_hashes && phase.ideas.published_after(allow_posting_again_after.ago).exists?(author_hash: author_hashes)
      end

      false
    end

    def liking_limit_reached?
      phase.reacting_like_limited? && user.reactions.up.where(reactable: phase.ideas).size >= phase.reacting_like_limited_max
    end

    def disliking_limit_reached?
      phase.reacting_dislike_limited? && user.reactions.down.where(reactable: phase.ideas).size >= phase.reacting_dislike_limited_max
    end

    def participation_method
      @participation_method ||= phase.pmethod
    end
  end
end
