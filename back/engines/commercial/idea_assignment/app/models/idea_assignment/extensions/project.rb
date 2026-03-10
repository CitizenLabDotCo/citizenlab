# frozen_string_literal: true

module IdeaAssignment
  module Extensions
    module Project
      def self.included(base)
        base.class_eval do
          belongs_to :default_assignee, class_name: 'User', optional: true
          before_validation :clear_invalid_assignee_on_folder_change
          validate :assignee_can_moderate_project
        end
      end

      # Clear assignee if folder is changing and they can no longer moderate
      def clear_invalid_assignee_on_folder_change
        return unless admin_publication&.parent_id_changed? && default_assignee
        
        # Create temporary clones to check moderation with the new folder context (or no folder)
        temp_admin_pub = admin_publication.dup
        temp_admin_pub.parent = admin_publication.parent_id ? AdminPublication.find(admin_publication.parent_id) : nil
        
        temp_project = dup
        temp_project.admin_publication = temp_admin_pub
        
        self.default_assignee = nil unless UserRoleService.new.can_moderate_project?(temp_project, default_assignee)
      end

      def assignee_can_moderate_project
        return unless default_assignee && project && !UserRoleService.new.can_moderate_project?(project, default_assignee)

        errors.add(
          :default_assignee_id,
          :assignee_can_not_moderate_project,
          message: 'The default assignee can not moderate the project'
        )
      end
    end
  end
end
