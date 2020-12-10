module ProjectFolders
  module WebApi::V1::ProjectsControllerDecorator

    # Mixin that adds folder capabilities to +ProjectsController+.
    #
    # It makes the modification of the folder attribute of a project possible
    # (via POST / PUT / PATCH).
    #
    # It assumes that +ProjectsController+ defines an ActiveSupport callback
    # named +save_project+ and that when run the callback block returns a
    # pair with:
    # - a +Boolean+ that indicates if the project was successfully saved
    # - the project record (+Project+).

    def self.included(base)
      base.class_eval do
        set_callback :save_project, :before, :set_folder
      end
    end

    def set_folder
      folder_id = params.dig(:project, :folder_id)
      parent_id = AdminPublication.find_by(publication_type: 'ProjectFolders::Folder', publication_id: folder_id)&.id
      raise ActiveRecord::RecordNotFound if folder_id.present? && parent_id.nil?

      @project.build_admin_publication unless @project.admin_publication
      @project.admin_publication.assign_attributes(parent_id: parent_id)
    end
  end
end

WebApi::V1::ProjectsController.include(ProjectFolders::WebApi::V1::ProjectsControllerDecorator)
