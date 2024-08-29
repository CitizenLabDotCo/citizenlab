# frozen_string_literal: true

module BulkImportIdeas
  module Patches
    module IdeaPolicy
      def update?
        # Allow any ideas to be edited by a moderator if it has been imported
        return true if record.idea_import && (user && UserRoleService.new.can_moderate_project?(record.project, user))

        super
      end

      def show_idea_import?
        UserRoleService.new.can_moderate_project?(record.project, user)
      end
    end
  end
end
