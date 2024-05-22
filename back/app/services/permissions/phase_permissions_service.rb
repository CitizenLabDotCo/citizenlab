# frozen_string_literal: true

module Permissions
  class PhasePermissionsService < BasePermissionsService
    PHASE_DENIED_REASONS = {
      project_inactive: 'project_inactive'
    }.freeze

    POSTING_DENIED_REASONS = {
      not_ideation: 'not_ideation',
      posting_disabled: 'posting_disabled',
      posting_limited_max_reached: 'posting_limited_max_reached'
    }.freeze

    COMMENTING_DENIED_REASONS = {
      not_supported: 'not_supported',
      commenting_disabled: 'commenting_disabled'
    }.freeze

    REACTING_DENIED_REASONS = {
      not_ideation: 'not_ideation',
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

    def denied_reason_for_action(action, user, phase, project: phase&.project, reaction_mode: nil)
      return PHASE_DENIED_REASONS[:project_inactive] unless phase

      phase_denied_reason = case action
      when 'posting_idea'
        posting_idea_denied_reason_for_phase(phase, user)
      when 'commenting_idea'
        commenting_idea_denied_reason_for_phase(phase)
      when 'reacting_idea'
        reacting_denied_reason_for_phase(phase, user, reaction_mode: reaction_mode)
      when 'voting'
        voting_denied_reason_for_phase(phase, user)
      when 'annotating_document'
        annotating_document_denied_reason_for_phase(phase)
      when 'taking_survey'
        taking_survey_denied_reason_for_phase(phase)
      when 'taking_poll'
        taking_poll_denied_reason_for_phase(phase, user)
      else
        raise "Unsupported action: #{action}"
      end
      return phase_denied_reason if phase_denied_reason

      super action, user, phase, project: project
    end

    alias denied_reason_for_phase denied_reason_for_action

    private

    # Phase methods
    def posting_idea_denied_reason_for_phase(phase, user)
      if !Factory.instance.participation_method_for(phase).posting_allowed?
        POSTING_DENIED_REASONS[:not_ideation] # TODO: native surveys allow posting too - change reason code?
      elsif !phase.posting_enabled
        POSTING_DENIED_REASONS[:posting_disabled]
      elsif user && posting_limit_reached?(phase, user)
        POSTING_DENIED_REASONS[:posting_limited_max_reached]
      end
    end

    def commenting_idea_denied_reason_for_phase(phase)
      if !phase.can_contain_ideas?
        COMMENTING_DENIED_REASONS[:not_supported]
      elsif !phase.commenting_enabled
        COMMENTING_DENIED_REASONS[:commenting_disabled]
      end
    end

    def reacting_denied_reason_for_phase(phase, user, reaction_mode: nil)
      if !phase.ideation?
        REACTING_DENIED_REASONS[:not_ideation]
      elsif !phase.reacting_enabled
        REACTING_DENIED_REASONS[:reacting_disabled]
      elsif reaction_mode == 'down' && !phase.reacting_dislike_enabled
        REACTING_DENIED_REASONS[:reacting_dislike_disabled]
      elsif reaction_mode == 'up' && user && liking_limit_reached?(phase, user)
        REACTING_DENIED_REASONS[:reacting_like_limited_max_reached]
      elsif reaction_mode == 'down' && user && disliking_limit_reached?(phase, user)
        REACTING_DENIED_REASONS[:reacting_dislike_limited_max_reached]
      end
    end

    def taking_survey_denied_reason_for_phase(phase)
      unless phase.survey?
        TAKING_SURVEY_DENIED_REASONS[:not_survey]
      end
    end

    def annotating_document_denied_reason_for_phase(phase)
      unless phase.document_annotation?
        ANNOTATING_DOCUMENT_DENIED_REASONS[:not_document_annotation]
      end
    end

    def taking_poll_denied_reason_for_phase(phase, user)
      if !phase.poll?
        TAKING_POLL_DENIED_REASONS[:not_poll]
      elsif user && phase.poll_responses.exists?(user: user)
        TAKING_POLL_DENIED_REASONS[:already_responded]
      end
    end

    def voting_denied_reason_for_phase(phase, _user)
      unless phase.voting?
        VOTING_DENIED_REASONS[:not_voting]
      end
    end

    # Helper methods

    def posting_limit_reached?(phase, user)
      if phase.posting_limited?
        num_authored = phase.ideas.where(author: user, publication_status: 'published').size
        return true if num_authored >= phase.posting_limited_max

        if phase.allow_anonymous_participation?
          author_hash = Idea.create_author_hash user.id, phase.project.id, true
          num_authored_anonymously = phase.ideas.where(author_hash: author_hash).size
          return true if (num_authored + num_authored_anonymously) >= phase.posting_limited_max
        end
      end

      false
    end

    def liking_limit_reached?(phase, user)
      phase.reacting_like_limited? && user.reactions.up.where(reactable: phase.ideas).size >= phase.reacting_like_limited_max
    end

    def disliking_limit_reached?(phase, user)
      phase.reacting_dislike_limited? && user.reactions.down.where(reactable: phase.ideas).size >= phase.reacting_dislike_limited_max
    end
  end
end
