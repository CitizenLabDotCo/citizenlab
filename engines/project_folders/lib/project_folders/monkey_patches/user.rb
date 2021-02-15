module ProjectFolders
  module MonkeyPatches
    module User
      def roles_json_schema
        Rails.root.join('engines/project_folders/config/schemas/user_roles.json_schema').to_s
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
end
