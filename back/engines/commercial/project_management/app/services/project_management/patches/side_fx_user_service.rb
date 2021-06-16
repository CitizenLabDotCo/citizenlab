# frozen_string_literal: true

module ProjectManagement
  module Patches
    module SideFxUserService
      def role_created_side_fx(role, user, current_user)
        new_project_moderator(role, user, current_user) if role['type'] == 'project_moderator'
        super
      end

      def role_destroyed_side_fx(role, user, current_user)
        project_moderator_destroyed(role, user, current_user) if role['type'] == 'project_moderator'
        super
      end

      private

      def new_project_moderator(role, user, current_user)
        LogActivityJob.set(wait: 5.seconds).perform_later(
          user, 'project_moderation_rights_given',
          current_user, Time.now.to_i,
          payload: { project_id: role['project_id'] }
        )
      end

      def project_moderator_destroyed(_role, user, current_user)
        LogActivityJob.perform_later(user, 'project_moderation_rights_removed', current_user, Time.now.to_i)
      end
    end
  end
end
