module IdeaAssignment
  module Patches
    module WebApi
      module V1
        module IdeasController
          def idea_attributes
            project = @idea&.project || Project.find(params.dig(:idea, :project_id))
            if project && UserRoleService.new.can_moderate_project?(project, current_user)
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
