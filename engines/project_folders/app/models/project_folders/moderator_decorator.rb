module ProjectFolders
  module ModeratorDecorator
    def self.prepended(base)
      base.class_eval do
        has_many_roles :project_folder_moderator,
                       class: 'ProjectFolders::Folder',
                       foreign_key: 'project_folder_id'
      end
    end

    def roles_json_schema
      Rails.root.join('engines', 'project_folders', 'config', 'schemas', 'user_roles.json_schema').to_s
    end

    def moderated_project_folders
      project_folder_moderator_project_folders_folders
    end

    def moderated_project_folder_ids
      project_folder_moderator_project_folders_folder_ids
    end

    def highest_role
      if super_admin?                 then :super_admin
      elsif admin?                    then :admin
      elsif project_folder_moderator? then :project_folder_moderator
      elsif project_moderator?        then :project_moderator
      else                                 :user
      end
    end
  end
end

# User.prepend(ProjectFolders::ModeratorDecorator)
