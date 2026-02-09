# frozen_string_literal: true

module Files
  class FileAttachmentPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        # Resetting the order because it interferes with +pluck+ and sometimes results in
        # an invalid query.
        attachable_types = scope.distinct.reorder(nil).pluck(:attachable_type)

        # Filter attachable types and handle authorization errors for each type.
        # Some attachable types may raise NotAuthorizedError (e.g., when their policy scope
        # doesn't exist or the user doesn't have access), so we filter those out.
        scoped_attachments = attachable_types.filter_map do |attachable_type|
          scope.where(attachable_type: attachable_type, attachable_id: scope_for(attachable_type.constantize))
        rescue Pundit::NotAuthorizedError
          # Skip attachments for resources the user cannot access
          nil
        end.reduce(scope.none, :or)

        scoped_attachments
      end
    end

    def show?
      policy_for(record.attachable).show?
    end

    def create?
      return false unless policy_for(record.attachable).update?

      # For idea files, the attachment should be created at the same time as the file.
      # Attaching existing files to an idea or attaching an idea file to other resources
      # is not allowed.
      if record.attachable_type == 'Idea'
        record.file.new_record?
      else
        policy_for(record.file).update?
      end
    end

    def update?
      policy_for(record.attachable).update?
    end

    def destroy?
      policy_for(record.attachable).update?
    end

    private

    def active_moderator?(project)
      return false unless active?

      UserRoleService.new.can_moderate_project? project, user
    end
  end
end
