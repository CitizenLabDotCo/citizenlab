# frozen_string_literal: true

module ProjectManagement
  module Patches
    module ProjectPolicy
      def self.prepended(base)
        base::Scope.prepend(Scope)
        base::InverseScope.prepend(InverseScope)
      end

      module Scope
        def resolve
          super.or resolve_for_project_moderator
        end

        private

        def resolve_for_project_moderator
          scope.where(id: user&.moderatable_project_ids)
        end
      end

      module InverseScope
        def resolve
          super.or(scope.project_moderator(record.id))
        end
      end
    end
  end
end
