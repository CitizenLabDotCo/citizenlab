module IdeaAssignment
  module Patches
    module WebApi
      module V1
        module IdeasController
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
