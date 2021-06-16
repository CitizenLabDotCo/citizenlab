# frozen_string_literal: true

module ProjectManagement
  module Patches
    module SideFxProjectService
      def after_destroy(frozen_project, user)
        remove_moderators(frozen_project.id)
        super
      end

      private

      def remove_moderators(project_id)
        ::User.project_moderator(project_id).all.each do |moderator|
          moderator.delete_role 'project_moderator', project_id: project_id
          moderator.save!
        end
      end
    end
  end
end
