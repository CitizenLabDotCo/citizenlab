module ProjectFolders
  module Patches
    module SideFxProjectService
      def before_update(project, current_user)
        super
        @folder_id_was = project.admin_publication.parent_id_was
      end

      def after_update(project, current_user)
        super
        if @folder_id_was != project.folder_id
          after_folder_changed project, current_user
        end
      end
    end
  end
end
