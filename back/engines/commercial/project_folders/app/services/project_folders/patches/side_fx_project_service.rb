module ProjectFolders
  module Patches
    module SideFxProjectService
      def before_update(project, current_user)
        super
        @folder_id_was = project.admin_publication.parent_id_was
      end

      def after_update(project, current_user)
        super
        after_folder_changed project, current_user if @folder_id_was != project.folder_id
      end
    end
  end
end
