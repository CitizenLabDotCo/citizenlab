module ProjectFolders
  module RoledDecorator
    def self.prepended(base)
      base.class_eval do
        has_many_roles :project_folder_moderator,
                       through: :admin_publication_moderator,
                       class: 'ProjectFolders::Folder',
                       source: :publication
      end
    end

    def moderated_project_folders
      project_folder_moderator_project_folders_folders
    end

    def moderated_project_folder_ids
      project_folder_moderator_project_folders_folder_ids
    end
  end
end

# User.prepend(ProjectFolders::RoledDecorator)
