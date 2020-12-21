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
        set_callback :save_project, :after, :add_new_folder_moderators
        set_callback :save_project, :after, :remove_old_folder_moderators
      end
    end

    def set_folder
      return unless params.require(:project).key?(:folder_id)

      @project.folder_id = params.dig(:project, :folder_id)
    end

    def add_new_folder_moderators
      return unless params.require(:project).key?(:folder_id)

      User.project_folder_moderator(@project.folder&.id).each do |moderator|
        next if moderator.moderatable_project_ids.include?(@project.id)

        moderator.add_role('project_moderator', project_id: @project.id)
        moderator.save
      end
    end

    def remove_old_folder_moderators
      return unless params.require(:project).key?(:folder_id)

      User.project_folder_moderator(@project.folder&.id).each do |moderator|
        next unless moderator.moderatable_project_ids.include?(@project.id)

        moderator.delete_role('project_moderator', project_id: @project.id)
        moderator.save
      end
    end
  end
end

WebApi::V1::ProjectsController.include(ProjectFolders::WebApi::V1::ProjectsControllerDecorator)
