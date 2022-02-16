module IdeaAssignment
  class IdeaAssignmentService
    def assign_idea!(idea, default_assignee: true)
      new_assignee = default_assignee ? default_assignee(idea.project) : nil
      return if idea.assignee && UserRoleService.new.can_moderate_project?(idea.project, idea.assignee)

      idea.update! assignee: new_assignee
    end

    def assign_project_ideas!(project, default_assignee: true)
      new_assignee = default_assignee ? default_assignee(project) : nil
      project.ideas
             .where.not(assignee: UserRoleService.new.moderators_for_project(project))
             .update_all(assignee_id: new_assignee&.id)
    end

    def default_assignee(project)
      project&.default_assignee
    end
  end
end
