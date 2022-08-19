# frozen_string_literal: true

module IdeaAssignment
  module Patches
    module SideFxProjectService
      def before_create(project, current_user)
        super
        set_default_assignee(project, current_user)
      end

      private

      def after_folder_changed(project, current_user)
        super
        if project.default_assignee && !UserRoleService.new.can_moderate_project?(project.reload, project.default_assignee)
          project.update! default_assignee: nil
        end
        IdeaAssignmentService.new.clean_assignees_for_project! project
      end

      def set_default_assignee(project, current_user)
        project.default_assignee ||= if current_user&.super_admin?
          ::User.oldest_admin
        else
          current_user
        end
      end
    end
  end
end
