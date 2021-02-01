module ProjectFolders
  module MonkeyPatches
    module ProjectPolicy
      module Scope
        def user_moderates?
          super || user.project_folder_moderator?
        end
      end

      def create?
        super || user&.moderates_parent_folder?(record)
      end
    end
  end
end
