# frozen_string_literal: true

module IdeaAssignment
  module Patches
    module SideFxUserService
      private

      def after_roles_changed(current_user, user)
        super
        clean_project_default_assignee_for_user! user
        IdeaAssignmentService.new.clean_idea_assignees_for_user! user
      end

      def clean_project_default_assignee_for_user!(user)
        moderatable_projects = UserRoleService.new.moderatable_projects user
        user.default_assigned_projects.where.not(id: moderatable_projects).update_all(default_assignee_id: nil)
      end
    end
  end
end
