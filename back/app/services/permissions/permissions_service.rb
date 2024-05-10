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

    def initialize
      super
      @timeline_service = TimelineService.new
    end

    # NOTE: Where phase is nil, the check is for global permissions (ie initiatives)
    def denied_reason_for_user(user, action, phase = nil)
      permission = find_permission(action, phase)
      user_denied_reason(permission, user)
    end

    def denied_reason_for_project(project, user, action, reaction_mode: nil)
      project_visible_reason = project_visible_disabled_reason(project, user)
      if project_visible_reason
        project_visible_reason
      else
        phase = @timeline_service.current_phase_not_archived project
        denied_reason_for_phase phase, user, action, reaction_mode: reaction_mode
      end
    end

    def denied_reason_for_phase(phase, user, action, reaction_mode: nil)
      return PROJECT_DENIED_REASONS[:project_inactive] unless phase

      phase_denied_reason = case action
      when 'posting_idea'
        posting_idea_disabled_reason_for_phase(phase, user)
      when 'commenting_idea'
        commenting_idea_disabled_reason_for_phase(phase)
      when 'reacting_idea'
        reacting_disabled_reason_for_phase(phase, user, reaction_mode: reaction_mode)
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

      denied_reason_for_user(user, action, phase)
    end

    def denied_reason_for_idea(idea, user, action, reaction_mode: nil)
      reason = denied_reason_for_project idea.project, user, action, reaction_mode: reaction_mode
      return reason if reason

      current_phase = @timeline_service.current_phase_not_archived idea.project
      if current_phase && !idea_in_current_phase?(idea, current_phase)
        IDEA_DENIED_REASONS[:idea_not_in_current_phase]
      end
    end

    def denied_reason_for_idea_reaction(reaction, user, reaction_mode: nil)
      reaction_mode ||= reaction.mode
      idea = reaction.reactable
      denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: reaction_mode)
    end

    # Future enabled phases
    def future_enabled_phase(project, user, action, reaction_mode: nil)
      time = Time.zone.now
      @timeline_service.future_phases(project, time).find { |phase| !denied_reason_for_phase(phase, user, action, reaction_mode: reaction_mode) }
    end

    private

    # TODO: JS - Need to preload these permissions - else this is being called for every call to denied_reason_for_resource
    # 10 x per project
    # 11 x per idea
    def find_permission(action, phase)
      scope = phase&.permission_scope
      permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)

      if permission.blank? && Permission.available_actions(scope)
        Permissions::PermissionsUpdateService.new.update_permissions_for_scope scope
        permission = Permission.includes(:groups).find_by(permission_scope: scope, action: action)
      end

      raise "Unknown action '#{action}' for phase: #{phase}" unless permission

      permission
    end

    # User methods
    def user_denied_reason(permission, user)
      if permission.permitted_by == 'everyone'
        user ||= User.new
      else
        return USER_DENIED_REASONS[:not_signed_in] unless user
        return USER_DENIED_REASONS[:blocked] if user.blocked?

        unless user.confirmation_required? # Ignore non confirmed users as this will be picked up by UserRequirementsService
          return USER_DENIED_REASONS[:not_active] unless user.active?
          return if UserRoleService.new.can_moderate? permission.permission_scope, user
          return USER_DENIED_REASONS[:not_permitted] if permission.permitted_by == 'admins_moderators'

          if permission.permitted_by == 'groups'
            reason = denied_when_permitted_by_groups?(permission, user)
            return USER_DENIED_REASONS[reason] if reason.present?
          end
        end
      end
      return if Permissions::UserRequirementsService.new.requirements(permission, user)[:permitted]

      USER_DENIED_REASONS[:missing_data]
    end

    # NOTE: method overridden in the verification engine when enabled
    def denied_when_permitted_by_groups?(permission, user)
      :not_in_group unless user.in_any_groups?(permission.groups)
    end

    # Project methods
    def project_visible_disabled_reason(project, user)
      if (project.visible_to == 'admins' && !user.admin?) ||
         (project.visible_to == 'groups' && !user.in_any_groups?(project.groups))
        PROJECT_DENIED_REASONS[:project_not_visible]
      end
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

    def reacting_disabled_reason_for_phase(phase, user, reaction_mode: nil)
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

    def taking_survey_disabled_reason_for_phase(phase)
      unless phase.survey?
        TAKING_SURVEY_DENIED_REASONS[:not_survey]
      end
    end

    def annotating_document_disabled_reason_for_phase(phase)
      unless phase.document_annotation?
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
      unless phase.voting?
        VOTING_DENIED_REASONS[:not_voting]
      end
    end

    # Helper methods

    def idea_in_current_phase?(idea, current_phase)
      idea.ideas_phases.find { |ip| ip.phase_id == current_phase.id }
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
  end
end

Permissions::PermissionsService.prepend(Verification::Patches::Permissions::PermissionsService)
