# frozen_string_literal: true

module ProjectManagement
  module Patches
    module StatUserPolicy
      def self.prepended(base)
        base::Scope.prepend(Scope)
      end

      module Scope
        def resolve_for_active
          super.or(resolve_for_project_moderator)
        end

        def resolve_for_project_moderator
          return scope.none unless user.project_moderator?

          user.moderatable_projects
              .map { |project| ::ProjectPolicy::InverseScope.new(project, scope).resolve }
              .reduce(:or)
        end
      end

      def show_stats_to_active?
        admin? || user.project_moderator?
      end
    end
  end
end
