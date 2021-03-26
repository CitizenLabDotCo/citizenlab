# frozen_string_literal: true

module ProjectPermissions
  module Patches
    module SideFxUserService
      def lost_role_sidefx(_current_user, role, user)
        return unless role['type'] == 'project_moderator'

        SideFxModeratorService.new.after_destroy(user, Project.find(role['project_id']), current_user)
      end

      def gained_role_sidefx(current_user, role, user)
        return unless role['type'] == 'project_moderator'

        SideFxModeratorService.new.after_create(user, Project.find(role['project_id']), current_user)
      end
    end
  end
end
