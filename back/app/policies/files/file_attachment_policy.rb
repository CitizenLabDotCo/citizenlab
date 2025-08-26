# frozen_string_literal: true

module Files
  class FileAttachmentPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        # Resetting the order because it interferes with +pluck+ and sometimes results in
        # an invalid query.
        attachable_types = scope.distinct.reorder(nil).pluck(:attachable_type)

        attachable_types.map do |attachable_type|
          scope.where(attachable_type: attachable_type, attachable_id: scope_for(attachable_type.constantize))
        end.reduce(scope.none, :or)
      end
    end

    def show?
      policy_for(record.attachable).show?
    end

    def create?
      return false unless policy_for(record.attachable).update?

      # For idea files, the attachment should be created at the same time as the file.
      # Attaching the file to other resources is not allowed.
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
  end
end
