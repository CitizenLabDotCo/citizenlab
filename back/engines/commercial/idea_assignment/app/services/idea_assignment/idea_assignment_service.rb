# frozen_string_literal: true

module IdeaAssignment
  class IdeaAssignmentService
    # Requirements:
    # - The assignee of an idea should always have
    #   moderation rights over that idea.
    # - New ideas are automatically assigned to a default
    #   assignee when not yet assigned, exept when the
    #   idea is a native survey response. This is currently
    #   just the project's default assignee if specified.
    # - When an assignee can no longer moderate an idea,
    #   the idea should have no assignee.

    def clean_idea_assignees_for_user!(user)
      moderatable_projects = UserRoleService.new.moderatable_projects user
      user.assigned_ideas.where.not(project_id: moderatable_projects).update_all(assignee_id: nil)
    end

    def clean_assignees_for_project!(project)
      project.ideas
        .where.not(assignee: nil)
        .where.not(assignee: UserRoleService.new.moderators_for_project(project))
        .update_all(assignee_id: nil)
    end

    def automatically_assigned_idea_assignee(idea)
      return if idea.participation_method_on_creation.instance_of?(ParticipationMethod::NativeSurvey)

      idea&.project&.default_assignee
    end
  end
end
