module ProjectFolders
  module WebApi::V1::ProjectsControllerDecorator

    # Mixin that adds folder capabilities to +ProjectsController+.
    #
    # It makes the modification of the folder attribute of a project possible
    # (via POST / PUT / PATCH).
    #
    # It assumes that +ProjectsController+ provides a +:save_project+ ActiveSupport
    # callback that is triggered when a project is saved (modification / creation).
    # Also, when +save_project+ is run:
    # - its +project+ method should return the +ActiveRecord+ instance of the
    # project.
    # - its +project_saved+ should return if the save operation has been successful
    # (only for +:after+ callbacks).

    def self.included(base)
      base.class_eval do
        set_callback :save_project, :after, :set_folder!
      end
    end

    def set_folder!
      return unless project_saved
      return unless params.require(:project).key? :folder_id
      folder_id = params.dig(:project, :folder_id)
      project.set_folder!(folder_id)
    end

  end
end

WebApi::V1::ProjectsController.include(ProjectFolders::WebApi::V1::ProjectsControllerDecorator)