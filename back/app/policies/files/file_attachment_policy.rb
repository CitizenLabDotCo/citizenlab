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
      policy_for(record.attachable).update?
    end

    def update?
      policy_for(record.attachable).update?
    end

    def destroy?
      policy_for(record.attachable).update?
    end
  end
end
