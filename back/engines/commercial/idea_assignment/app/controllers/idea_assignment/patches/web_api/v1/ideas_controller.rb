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
