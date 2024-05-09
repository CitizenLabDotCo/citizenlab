# frozen_string_literal: true

module Permissions
  class PermissionsService
    USER_DENIED_REASONS = {
      not_signed_in: 'not_signed_in',
      not_active: 'not_active',
      not_permitted: 'not_permitted',
      not_in_group: 'not_in_group',
      missing_data: 'missing_data',
      not_verified: 'not_verified',
      blocked: 'blocked'
    }.freeze

    PROJECT_DENIED_REASONS = {
      project_inactive: 'project_inactive',
      project_not_visible: 'project_not_visible'
    }.freeze

    IDEA_DENIED_REASONS = {
      idea_not_in_current_phase: 'idea_not_in_current_phase'
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
      reacting_dislike_limited_max_reached: 'reacting_dislike_limited_max_reached',
    }.freeze

    VOTING_DENIED_REASONS = {
      not_voting: 'not_voting',
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

    def initialize
      super
      @timeline_service = TimelineService.new
    end

    def denied_reason_for_resource(user, action, resource = nil)
      # Change to get_permission or something like
      scope = resource&.permission_scope
      permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)

      if permission.blank? && Permission.available_actions(scope)
        Permissions::PermissionsUpdateService.new.update_permissions_for_scope scope
        permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)
      end

      raise "Unknown action '#{action}' for resource: #{resource}" unless permission

      denied_reason_for_user permission, user
    end

    def denied_reason_for_project(project, user, action)
      project_visible_reason = project_visible_disabled_reason(project, user)
      if project_visible_reason
        project_visible_reason
      else
        phase = @timeline_service.current_phase_not_archived project
        denied_reason_for_phase phase, user, action
      end
    end

    def denied_reason_for_phase(phase, user, action)
      return PROJECT_DENIED_REASONS[:project_inactive] if !phase

      phase_denied_reason = case action
      when 'posting_idea'
        posting_idea_disabled_reason_for_phase(phase, user)
      when 'commenting_idea'
        commenting_idea_disabled_reason_for_phase(phase)
      when 'reacting_idea'
        idea_reacting_disabled_reason_for(phase, user)
      when 'voting'
        voting_disabled_reason_for_phase(phase, user)
      when 'annotating_document'
        annotating_document_disabled_reason_for_phase(phase)
      when 'taking_survey'
        taking_survey_disabled_reason_for_phase(phase)
      when 'taking_poll'
        taking_poll_disabled_reason_for_phase(phase, user)
      else
        raise "Unsupported action: #{action}"
      end
      return phase_denied_reason if phase_denied_reason

      denied_reason_for_resource(user, action, phase)
    end

    # IDEA METHODS
    def denied_reason_for_idea(idea, user, action)
      # TODO: JS - only allow for certain actions? Only commenting_idea && voting
      current_phase = @timeline_service.current_phase_not_archived idea.project
      # TODO: JS - Does it matter that project_inactive now comes later? Which it was for 'commenting_idea' Feels like idea specific reasons should come last tbh
      # if !active_phase
      #   PROJECT_DENIED_REASONS[:project_inactive]
      if current_phase && !idea_in_current_phase?(idea, current_phase)
        IDEA_DENIED_REASONS[:idea_not_in_current_phase]
      else
        denied_reason_for_phase current_phase, user, action
      end
    end

    def reacting_disabled_reason_for_idea_comment(comment, user)
      denied_reason_for_idea comment.post, user, 'commenting_idea'
    end

    def idea_reacting_disabled_reason_for(object, user, mode: nil)
      phase = nil
      idea = nil
      case object.class.name
      when Reaction.name
        mode ||= object.mode
        idea = object.reactable
        phase = @timeline_service.current_phase_not_archived idea.project
      when Idea.name
        idea = object
        phase = @timeline_service.current_phase_not_archived idea.project
      when Project.name
        phase = @timeline_service.current_phase_not_archived object
      when Phase.name
        # This allows checking for future or past
        # phases instead of the current phase.
        phase = object
      else
        ErrorReporter.report_msg("Unsupported context type #{object.class.name}")
        'unsupported_context_type' # TODO: JS - constantize this?
      end

      # TODO: JS - make more generic
      # At some point, it may become more desirable
      # to either return multiple reasons or have
      # a predefined ranking of reasons to return
      # the reason with the highest rank.
      return PROJECT_DENIED_REASONS[:project_inactive] unless phase

      reason = general_idea_reacting_disabled_reason(phase, user)
      return reason if reason
      return IDEA_DENIED_REASONS[:idea_not_in_current_phase] if idea && !idea_in_current_phase?(idea, phase)

      if mode
        reason = mode_specific_idea_reacting_disabled_reason(mode, phase, user)
        return reason if reason
      end

      denied_reason_for_resource user, 'reacting_idea', phase
    end

    def cancelling_reacting_disabled_reason_for_idea(idea, user)
      phase = @timeline_service.current_phase_not_archived idea.project
      if !phase
        REACTING_DENIED_REASONS[:project_inactive]
      elsif !phase.ideation?
        REACTING_DENIED_REASONS[:not_ideation]
      elsif !idea_in_current_phase? idea, phase
        REACTING_DENIED_REASONS[:idea_not_in_current_phase]
      elsif !phase.reacting_enabled
        REACTING_DENIED_REASONS[:reacting_disabled]
      else
        denied_reason_for_resource user, 'reacting_idea', @timeline_service.current_phase_not_archived(idea.project)
      end
    end

    # Future enabled phases
    def future_posting_idea_enabled_phase(project, user, time = Time.zone.now)
      @timeline_service.future_phases(project, time).find { |phase| !posting_idea_disabled_reason_for_phase(phase, user) }
    end

    def future_commenting_idea_enabled_phase(project, _user, time = Time.zone.now)
      @timeline_service.future_phases(project, time).find { |phase| !commenting_idea_disabled_reason_for_phase(phase) }
    end

    def future_liking_idea_enabled_phase(project, user, time = Time.zone.now)
      @timeline_service.future_phases(project, time).find { |phase| !idea_reacting_disabled_reason_for(phase, user, mode: 'up') }
    end

    def future_disliking_idea_enabled_phase(project, user, time = Time.zone.now)
      @timeline_service.future_phases(project, time).find { |phase| !idea_reacting_disabled_reason_for(phase, user, mode: 'down') }
    end

    def future_comment_reacting_idea_enabled_phase(project, user, time = Time.zone.now)
      future_commenting_idea_enabled_phase(project, user, time)
    end

    def future_voting_enabled_phase(project, user, time = Time.zone.now)
      @timeline_service.future_phases(project, time).find { |phase| !voting_disabled_reason_for_phase(phase, user) }
    end

    private

    # User methods
    def denied_reason_for_user(permission, user)
      if permission.permitted_by == 'everyone'
        user ||= User.new
      else
        return USER_DENIED_REASONS[:not_signed_in] if !user
        return USER_DENIED_REASONS[:blocked] if user.blocked?

        if !user.confirmation_required? # Ignore confirmation as this will be checked by the requirements
          return USER_DENIED_REASONS[:not_active] if !user.active?
          return if UserRoleService.new.can_moderate? permission.permission_scope, user
          return USER_DENIED_REASONS[:not_permitted] if permission.permitted_by == 'admins_moderators'

          if permission.permitted_by == 'groups'
            reason = denied_when_permitted_by_groups?(permission, user)
            return USER_DENIED_REASONS[reason] if reason.present?
          end
        end
      end
      return if Permissions::RegistrationRequirementsService.new.requirements(permission, user)[:permitted]

      USER_DENIED_REASONS[:missing_data]
    end

    def denied_when_permitted_by_groups?(permission, user)
      :not_in_group unless user.in_any_groups?(permission.groups)
    end

    # Phase methods
    def posting_idea_disabled_reason_for_phase(phase, user)
      if !Factory.instance.participation_method_for(phase).posting_allowed?
        POSTING_DENIED_REASONS[:not_ideation] # TODO: native surveys allow posting too - change reason code?
      elsif !phase.posting_enabled
        POSTING_DENIED_REASONS[:posting_disabled]
      elsif user && posting_limit_reached?(phase, user)
        POSTING_DENIED_REASONS[:posting_limited_max_reached]
      end
    end

    def commenting_idea_disabled_reason_for_phase(phase)
      if !phase.can_contain_ideas?
        COMMENTING_DENIED_REASONS[:not_supported]
      elsif !phase.commenting_enabled
        COMMENTING_DENIED_REASONS[:commenting_disabled]
      end
    end

    def taking_survey_disabled_reason_for_phase(phase)
      if !phase.survey?
        TAKING_SURVEY_DENIED_REASONS[:not_survey]
      end
    end

    def annotating_document_disabled_reason_for_phase(phase)
      if !phase.document_annotation?
        ANNOTATING_DOCUMENT_DENIED_REASONS[:not_document_annotation]
      end
    end

    def taking_poll_disabled_reason_for_phase(phase, user)
      if !phase.poll?
        TAKING_POLL_DENIED_REASONS[:not_poll]
      elsif user && phase.poll_responses.exists?(user: user)
        TAKING_POLL_DENIED_REASONS[:already_responded]
      end
    end

    def voting_disabled_reason_for_phase(phase, _user)
      if !phase.voting?
        VOTING_DENIED_REASONS[:not_voting]
      end
    end

    def idea_in_current_phase?(idea, current_phase)
      idea.ideas_phases.find { |ip| ip.phase_id == current_phase.id }
    end

    # Common reason regardless of the reaction type.
    def general_idea_reacting_disabled_reason(phase, _user)
      if !phase.ideation?
        REACTING_DENIED_REASONS[:not_ideation]
      elsif !phase.reacting_enabled
        REACTING_DENIED_REASONS[:reacting_disabled]
      end
    end

    def mode_specific_idea_reacting_disabled_reason(mode, phase, user)
      case mode
      when 'up'
        if user && liking_limit_reached?(phase, user)
          REACTING_DENIED_REASONS[:reacting_like_limited_max_reached]
        end
      when 'down'
        if !phase.reacting_dislike_enabled
          REACTING_DENIED_REASONS[:reacting_dislike_disabled]
        elsif user && disliking_limit_reached?(phase, user)
          REACTING_DENIED_REASONS[:reacting_dislike_limited_max_reached]
        end
      else
        ErrorReporter.report_msg("Unsupported reaction type #{mode}")
        'unsupported_reaction_type'
      end
    end

    def posting_limit_reached?(phase, user)
      return true if phase.posting_limited? &&
                     phase.ideas.where(author: user, publication_status: 'published').size >= phase.posting_limited_max

      if phase.posting_limited? && phase.allow_anonymous_participation?
        author_hash = Idea.create_author_hash user.id, phase.project.id, true
        return phase.ideas.where(author_hash: author_hash).or(phase.ideas.where(author: user)).size >= phase.posting_limited_max
      end

      false
    end

    def liking_limit_reached?(phase, user)
      phase.reacting_like_limited? && user.reactions.up.where(reactable: phase.ideas).size >= phase.reacting_like_limited_max
    end

    def disliking_limit_reached?(phase, user)
      phase.reacting_dislike_limited? && user.reactions.down.where(reactable: phase.ideas).size >= phase.reacting_dislike_limited_max
    end

    def project_visible_disabled_reason(project, user)
      if (project.visible_to == 'admins' && !user.admin?) ||
         (project.visible_to == 'groups' && !user.in_any_groups?(project.groups))
        PROJECT_DENIED_REASONS[:project_not_visible]
      end
    end
  end
end

Permissions::PermissionsService.prepend(Verification::Patches::Permissions::PermissionsService)
