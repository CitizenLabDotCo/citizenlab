# frozen_string_literal: true

module ProjectFolders
  module WebApi
    module V1
      module Patches
        module ProjectsController
          # Mixin that adds folder capabilities to +ProjectsController+.
          #
          # It makes the modification of the folder attribute of a project possible
          # (via POST / PUT / PATCH).
          #
          # It assumes that +ProjectsController+ defines an ActiveSupport callback
          # named +save_project+ and that when run the callback block returns a
          # pair with:
          # * a +Boolean+ that indicates if the project was successfully saved
          # * the project record (+Project+).

          def self.included(base)
            base.class_eval do
              set_callback :save_project, :before, :set_folder
            end
          end

          def set_folder
            return unless params.require(:project).key?(:folder_id)

            @project.folder_id = params.dig(:project, :folder_id)
          end
        end
      end
    end
  end
end
