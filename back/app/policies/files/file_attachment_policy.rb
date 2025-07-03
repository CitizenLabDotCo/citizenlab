# frozen_string_literal: true

module Files
  class FileAttachmentPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        if active_admin?
          scope.all
        else
          # Only return file attachments for attachables that the user can access
          attachable_projects = UserRoleService.new.moderatable_projects(user)
          
          scope.joins(
            "LEFT JOIN projects ON file_attachments.attachable_type = 'Project' AND file_attachments.attachable_id = projects.id"
          ).joins(
            "LEFT JOIN ideas ON file_attachments.attachable_type = 'Idea' AND file_attachments.attachable_id = ideas.id"
          ).joins(
            "LEFT JOIN events ON file_attachments.attachable_type = 'Event' AND file_attachments.attachable_id = events.id"
          ).joins(
            "LEFT JOIN phases ON file_attachments.attachable_type = 'Phase' AND file_attachments.attachable_id = phases.id"
          ).joins(
            "LEFT JOIN static_pages ON file_attachments.attachable_type = 'StaticPage' AND file_attachments.attachable_id = static_pages.id"
          ).where(
            "(file_attachments.attachable_type = 'Project' AND projects.id IN (?)) OR " \
            "(file_attachments.attachable_type = 'Idea' AND ideas.project_id IN (?)) OR " \
            "(file_attachments.attachable_type = 'Event' AND events.project_id IN (?)) OR " \
            "(file_attachments.attachable_type = 'Phase' AND phases.project_id IN (?)) OR " \
            "(file_attachments.attachable_type = 'StaticPage')",
            attachable_projects.select(:id),
            attachable_projects.select(:id),
            attachable_projects.select(:id),
            attachable_projects.select(:id)
          )
        end
      end
    end

    def show?
      return false unless active?
      return true if admin?

      policy_for(record.attachable).show?
    end

    def create?
      return false unless active?
      return true if admin?

      policy_for(record.attachable).update?
    end

    def update?
      return false unless active?
      return true if admin?

      policy_for(record.attachable).update?
    end

    def destroy?
      return false unless active?
      return true if admin?

      policy_for(record.attachable).update?
    end
  end
end
