# frozen_string_literal: true

module IdeaAssignment
  module Patches
    module WebApi
      module V1
        module IdeasController
          def idea_attributes(custom_form)
            project = custom_form.participation_context&.project
            user_can_moderate_project = current_user && UserRoleService.new.can_moderate_project?(project, current_user)
            if project && user_can_moderate_project
              super + [:assignee_id]
            else
              super
            end
          end

          def filter_count_facets
            return super if !count_per_assignee?

            super + [[Facets::Column.new(:assignee_id), :assignee]]
          end

          # Assignees are staff data, so they are only counted for a user who moderates
          # every idea the facet is counted on: the ideas without the assignee filter.
          def count_per_assignee?
            return false if !current_user
            return true if current_user.admin?

            role_service = UserRoleService.new
            return false if !role_service.moderates_something?(current_user)

            counted_ideas = ideas_without_filter(:assignee)
            unmoderated_ideas = counted_ideas.where.not(project: role_service.moderatable_projects(current_user))
            unmoderated_ideas.none?
          end

          def serialization_options
            super.tap do |opts|
              opts[:include].push(:assignee) if current_user
            end
          end
        end
      end
    end
  end
end
